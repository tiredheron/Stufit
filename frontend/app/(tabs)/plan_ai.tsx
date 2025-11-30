// (tabs)/plan_ai.tsx — Plan AI 화면

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
  Keyboard,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_WIDTH = 820;

/* --------------------------------------------------
   플랫폼별 서버 호스트 자동 설정
-------------------------------------------------- */
function getApiHost() {
  if (Platform.OS === 'android') return '10.0.2.2';
  if (Platform.OS === 'ios') return 'localhost';
  const uri = Constants.expoConfig?.hostUri;
  return uri ? uri.split(':')[0] : 'localhost';
}

const API_BASE = `http://${getApiHost()}:4000`; // Node.js
const AI_BASE = `http://${getApiHost()}:8000`;  // FastAPI (Ollama 연동)

/* --------------------------------------------------
   타입 정의
-------------------------------------------------- */

type AttachedFile = {
  name: string;
  uri: string;
  mimeType?: string | null;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  file?: AttachedFile | null;
  isPlan?: boolean;
};

/* --------------------------------------------------
   Main Component
-------------------------------------------------- */

export default function PlanAI() {
  const { projectId, title, category } = useLocalSearchParams<{
    projectId?: string;
    title?: string;
    category?: string;
  }>();

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // 탭바 높이 + 세이프존
  const TABBAR_HEIGHT = 70;
  const ORIGINAL_BOTTOM = TABBAR_HEIGHT + insets.bottom;

  // Android 키보드 대응
  const [inputBottom, setInputBottom] = useState(ORIGINAL_BOTTOM);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      if (!focused) return;
      const keyboardHeight = e.endCoordinates.height;
      const extraOffset = keyboardHeight - ORIGINAL_BOTTOM;
      setInputBottom(extraOffset > 0 ? ORIGINAL_BOTTOM + extraOffset + 8 : ORIGINAL_BOTTOM);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setInputBottom(ORIGINAL_BOTTOM);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [focused, ORIGINAL_BOTTOM]);

  const planId = projectId ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text:
        (title ? ` "${title}" 프로젝트 계획을 도와줄게요.\n` : '') +
        '안녕하세요 \nPlan AI 입니다.\n파일을 올리거나 메시지를 보내보세요!',
      isPlan: false,
    },
  ]);

  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [loading, setLoading] = useState(false);

  // 로딩 메시지 ID
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);

  // 기준 PPT 파일 표시용
  const [planFile, setPlanFile] = useState<AttachedFile | null>(null);

  // 선택된 계획 (UI)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // 저장 중 표시
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  /* --------------------------------------------------
    이전 채팅 불러오기 (Node /api/chat/:planId)
  -------------------------------------------------- */
  const loadChatHistory = async () => {
    if (!planId) return;

    try {
      const res = await fetch(`${API_BASE}/api/chat/${planId}`);
      const data = await res.json();

      const rows: {
        chat_id: string;
        plan_id: string;
        role: "user" | "assistant";
        message: string;
        file_name?: string | null;
      }[] = Array.isArray(data) ? data : [];

      const history: ChatMessage[] = rows.map((c) => ({
        id: c.chat_id,
        role: c.role,
        text: c.message,
        file: c.file_name ? { name: c.file_name, uri: "", mimeType: null } : null,
        isPlan: false,
      }));


      setMessages((prev) => [...prev, ...history]);
    } catch (e) {
      console.log("⚠ 채팅 불러오기 실패:", e);
    }
  };

  /* --------------------------------------------------
     화면 열리면 자동 실행
  -------------------------------------------------- */
  useEffect(() => {
    // 프로젝트 변경 시 초기 인사말로 리셋
    setMessages([
      {
        id: '1',
        role: 'assistant',
        text:
          (title ? ` "${title}" 프로젝트 계획을 도와줄게요.\n` : '') +
          '안녕하세요 \nPlan AI 입니다.\n파일을 올리거나 메시지를 보내보세요!',
        isPlan: false,
      },
    ]);

    loadChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  /* --------------------------------------------------
     파일 선택 (PPT 등)
  -------------------------------------------------- */
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (!res.canceled) {
        const file = res.assets[0];
        const info: AttachedFile = {
          name: file.name,
          uri: file.uri,
          mimeType: file.mimeType ?? null,
        };
        setAttachedFile(info);
        setPlanFile(info);
      }
    } catch (e) {
      Alert.alert('파일 오류', '파일을 불러오는 중 오류가 발생했습니다.');
    }
  };

  /* --------------------------------------------------
     메시지 전송 → FastAPI + 채팅 저장
  -------------------------------------------------- */
const [lastSessionId, setLastSessionId] = useState<string | null>(null);
const [lastTodos, setLastTodos] = useState<any[]>([]); 

const handleSend = async () => {
  if (!input.trim() && !attachedFile) return;
  if (loading) return;

  const userMessageText = input.trim() || '(첨부된 파일만 전송)';

  const newUserMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    text: userMessageText,
    file: attachedFile,
    isPlan: false,
  };
  setMessages(prev => [...prev, newUserMessage]);

  // --- User chat DB 저장 ---
  if (planId) {
    try {
      await fetch(`${API_BASE}/api/chat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          role: "user",
          message: userMessageText,
          file_name: attachedFile ? attachedFile.name : null,
        }),
      });
    } catch (err) {
      console.log("User Chat Save Error:", err);
    }
  }

  setInput('');
  setAttachedFile(null);
  setLoading(true);

  // --- 로딩 메시지 추가 ---
  const loadingId = `loading-${Date.now()}`;
  setLoadingMessageId(loadingId);
  setMessages(prev => [
    ...prev,
    { id: loadingId, role: 'assistant', text: '계획 생성 중입니다.', isPlan: false }
  ]);

  let dotsIndex = 0;
  const dots = ['', '.', '..', '...', '..', '.', ''];
  const interval = setInterval(() => {
    dotsIndex = (dotsIndex + 1) % dots.length;
    setMessages(prev =>
      prev.map(m => m.id === loadingId
        ? { ...m, text: `계획 생성 중입니다${dots[dotsIndex]}` }
        : m
      )
    );
  }, 350);

  try {
    let response;

    // --- FastAPI 호출 ---
    if (planFile) {
      const formData = new FormData();
      formData.append('message', userMessageText);

      if (Platform.OS === 'web') {
        const blob = await (await fetch(planFile.uri)).blob();
        formData.append('file', blob, planFile.name);
      } else {
        formData.append('file', {
          uri: planFile.uri,
          name: planFile.name,
          type: planFile.mimeType || 'application/octet-stream',
        } as any);
      }

      response = await fetch(`${AI_BASE}/chat-with-file`, {
        method: 'POST',
        body: formData,
      });

    } else {
      response = await fetch(`${AI_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText }),
      });
    }

    clearInterval(interval);

    if (!response.ok) throw new Error('FastAPI 오류');
    const data = await response.json();

    // FastAPI 응답에서 session_id, todos 저장
    if (data.session_id) setLastSessionId(data.session_id);
    if (Array.isArray(data.todos)) setLastTodos(data.todos);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: data.answer,
      isPlan: true,
    };

    // --- AI 메시지 저장 ---
    if (planId) {
      try {
        await fetch(`${API_BASE}/api/chat/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_id: planId,
            role: "assistant",
            message: data.answer,
          }),
        });
      } catch (err) {
        console.log("AI Chat Save Error:", err);
      }
    }

    setMessages(prev => [
      ...prev.filter(m => m.id !== loadingId),
      botMsg
    ]);

  } catch (e) {
    console.log('AI Error:', e);
    Alert.alert('오류', 'AI 서버와 통신 중 문제가 발생했습니다.');
    setMessages(prev => prev.filter(m => m.id !== loadingId));
  } finally {
    clearInterval(interval);
    setLoading(false);
    setLoadingMessageId(null);
  }
};


/* --------------------------------------------------
   "이 계획으로 할게요" → Node 백엔드 저장 (todos도 함께)
-------------------------------------------------- */
const [isSaving, setIsSaving] = useState(false);

const handleSelectPlan = async (item: ChatMessage) => {
  if (isSaving) return;  // 이미 저장 중이면 실행 안됨

  if (!planId) {
    return Alert.alert("에러", "planId가 전달되지 않았습니다.");
  }

  if (!item.isPlan) return;

  if (!lastSessionId || !lastTodos.length) {
    return Alert.alert("오류", "AI가 생성한 To-do JSON이 없습니다.");
  }

  setSelectedPlanId(item.id);
  setSavingPlanId(item.id);

  console.log("📌 저장 요청:", {
    plan_id: planId,
    session_id: lastSessionId,
    todos: lastTodos,
  });

  try {
    const res = await fetch(`${API_BASE}/api/plans/ai/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: planId,
        session_id: lastSessionId,
        todos: lastTodos,
        ai_plan_text: item.text,
      }),
    });

    const data = await res.json();
    console.log("📌 저장 결과:", data);

    if (!res.ok || !data.success) throw new Error("저장 실패");

    Alert.alert("저장 완료!", "AI 계획 및 To-do가 데이터베이스에 저장되었습니다.");
  } catch (err) {
    console.log("❌ Save Error:", err);
    Alert.alert("오류", "AI 계획 저장 중 문제가 발생했습니다.");
  } finally {
    setSavingPlanId(null);
  }

  setIsSaving(true);
};

  /* --------------------------------------------------
     메시지 렌더링
  -------------------------------------------------- */
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isSaving = savingPlanId === item.id;
    const selectable = item.role === 'assistant' && item.isPlan;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
          ]}
        >
          <Text style={isUser ? styles.textUser : styles.textAssistant}>
            {item.text}
          </Text>

          {item.file && (
            <View style={styles.fileBadge}>
              <Text style={styles.fileBadgeText}>📎 {item.file.name}</Text>
            </View>
          )}

          {selectable && (
            <TouchableOpacity
              style={[
                styles.planButton,
                selectedPlanId === item.id && styles.planButtonSelected,
              ]}
              onPress={() => handleSelectPlan(item)}
              disabled={isSaving}
            >
              <Text
                style={[
                  styles.planButtonText,
                  selectedPlanId === item.id && styles.planButtonTextSelected,
                ]}
              >
                {isSaving
                  ? "저장 중..."
                  : selectedPlanId === item.id
                  ? "✅ 선택된 계획"
                  : "이 계획으로 할게요"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /* --------------------------------------------------
     UI 렌더링
  -------------------------------------------------- */
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.wrapper}>
        <View
          style={[
            styles.innerContainer,
            { width: width > MAX_WIDTH ? MAX_WIDTH : '90%' },
          ]}
        >
          <View className="header" style={styles.header}>
            <Text style={styles.title}>Plan AI</Text>
            <Text style={styles.subtitle}>
              {title
                ? `현재 프로젝트: ${title}`
                : '프로젝트·과목 계획을 도와드립니다.'}
            </Text>

            {planFile && (
              <View style={styles.pptBanner}>
                <Text style={styles.pptBannerText}>기준 PPT: {planFile.name}</Text>
              </View>
            )}

            {selectedPlanId && (
              <View style={styles.selectedPlanBanner}>
                <Text style={styles.selectedPlanBannerText}>선택된 계획 있음</Text>
              </View>
            )}
          </View>

          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
          />

          {/* 입력 영역 */}
          <View
            style={[
              styles.inputContainer,
              {
                bottom: inputBottom,
                position: "absolute",
                left: 0,
                right: 0,
              },
            ]}
          >
            {attachedFile && (
              <View style={styles.attachedFileBar}>
                <Text style={styles.attachedFileText}>📎 {attachedFile.name}</Text>
                <TouchableOpacity onPress={() => setAttachedFile(null)}>
                  <Text style={styles.removeFileText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.iconButton} onPress={handlePickFile}>
                <Text style={styles.iconText}>📎</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder="계획을 적어주세요..."
                value={input}
                onChangeText={setInput}
                multiline
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />

              <TouchableOpacity
                style={[styles.sendButton, loading && { opacity: 0.3 }]}
                onPress={handleSend}
                disabled={loading}
              >
                <Text style={styles.sendButtonText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------------- 스타일 ---------------- */

const TAB_BAR_HEIGHT = 70;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  innerContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f6f6ff',
    paddingBottom: TAB_BAR_HEIGHT,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    color: '#7c5cff',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  pptBanner: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
  },
  pptBannerText: {
    fontSize: 12,
    color: '#0369a1',
  },
  selectedPlanBanner: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
  },
  selectedPlanBannerText: {
    fontSize: 12,
    color: '#166534',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleAssistant: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 0,
  },
  bubbleUser: {
    backgroundColor: '#4f46e5',
    borderTopRightRadius: 0,
  },
  textAssistant: {
    color: '#111827',
    fontSize: 14,
  },
  textUser: {
    color: '#ffffff',
    fontSize: 14,
  },
  fileBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  fileBadgeText: {
    fontSize: 12,
    color: '#374151',
  },
  inputContainer: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: -150,
  },
  attachedFileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#e5e7ff',
  },
  attachedFileText: {
    flex: 1,
    fontSize: 12,
  },
  removeFileText: {
    marginLeft: 8,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  iconText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  sendButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
  },
  planButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  planButtonSelected: {
    backgroundColor: '#4f46e5',
  },
  planButtonText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  planButtonTextSelected: {
    color: '#ffffff',
  },
});
