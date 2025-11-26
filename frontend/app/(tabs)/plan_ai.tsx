import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function PlanAI() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      text: '안녕하세요 👋\n프로젝트 계획을 도와줄 Plan AI 입니다.\n파일을 올리거나 메시지를 보내보세요!',
    },
  ]);
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<any | null>(null); // { name, uri } 형태로 저장

  // 파일 선택하기
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const file = res.assets?.[0];
      if (file) {
        setAttachedFile({
          name: file.name,
          uri: file.uri,
        });
      }
    } catch (e) {
      console.log('DocumentPicker error:', e);
    }
  };

  // 메시지 보내기 (여기서 백엔드 / GPT 호출 붙이면 됨)
  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userMessageText = input.trim() || '(첨부 파일만 전송)';

    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: userMessageText,
      file: attachedFile,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setAttachedFile(null);

    const fakeAnswer = `이 메시지에 대한 계획 초안을 만들어 볼게요.\n\n"${userMessageText}"`;

    const newAssistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      text: fakeAnswer,
    };

    setMessages(prev => [...prev, newAssistantMessage]);
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.role === 'user';

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
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Plan AI</Text>
        <Text style={styles.subtitle}>
          선택한 프로젝트에 대한 계획을 만들어주는 화면이에요
        </Text>
      </View>

      {/* 메시지 리스트 */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        {/* 첨부 파일 이름 표시 */}
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
            placeholder="계획을 세우고 싶은 내용을 적어보세요..."
            value={input}
            onChangeText={setInput}
            multiline
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const TAB_BAR_HEIGHT = 70; // 아래 동그라미 있는 탭바 높이만큼 여유

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f6ff',
    paddingBottom: TAB_BAR_HEIGHT, // ✅ 탭바에 안 가려지도록 전체 화면에 여유
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
    color: '#7c5cff', // ✅ 가운데 동그라미 버튼 색과 맞춤
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
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
    paddingBottom: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: 40, // ✅ 탭바와 살짝 간격
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
});
