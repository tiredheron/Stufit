import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router'; // ✅ expo-router 사용

export default function TasksScreen() {
  const [projects, setProjects] = useState([
    { id: 1, category: 'Grocery shopping app design', title: 'Market Research' },
    { id: 2, category: 'Grocery shopping app design', title: 'Competitive Analysis' },
  ]);

  const [showCreateCard, setShowCreateCard] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const handleAddProjectPress = () => {
    setShowCreateCard(true); // 생성 카드 열기
  };

  const handleCreateProject = () => {
    if (!newTitle.trim()) return; // 제목은 필수

    const newProject = {
      id: Date.now(),
      category: newCategory || 'New Project',
      title: newTitle,
    };

    setProjects((prev) => [newProject, ...prev]); // 위에 추가
    setNewCategory('');
    setNewTitle('');
    setShowCreateCard(false);
  };

  const handleCancel = () => {
    setNewCategory('');
    setNewTitle('');
    setShowCreateCard(false);
  };

  const handlePressProject = (project: { id: number; title: string; category: string }) => {
    // ✅ PlanAI 화면으로 이동 (app/(tabs)/plna_ai.tsx 기준)
    router.push({
      pathname: '/plan_ai',
      params: {
        projectId: String(project.id),
        title: project.title,
        category: project.category,
      },
    });
  };

  return (
    <View style={styles.screen}>
      {/* ----- 상단 헤더 ----- */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Make Plan</Text>

        <Pressable style={styles.bellButton} onPress={() => {}}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </Pressable>
      </View>

      {/* ----- 프로젝트 추가 버튼 ----- */}
      <Pressable
        style={styles.addProjectButton}
        onPress={handleAddProjectPress}
      >
        <Text style={styles.addProjectText}>+ Add Project</Text>
        <Text style={styles.addProjectSubText}>
          새로운 프로젝트를 만들어 계획을 세우세요
        </Text>
      </Pressable>

      {/* ----- Task 리스트 ----- */}
      <ScrollView style={styles.list}>
        {/* ✅ 프로젝트 생성 카드 (버튼 눌렀을 때만 표시) */}
        {showCreateCard && (
          <View style={[styles.taskCard, styles.createCard]}>
            <Text style={styles.createTitle}>새 프로젝트 만들기</Text>

            <Text style={styles.inputLabel}>프로젝트 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 1학기 1주차 Plan"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor="gray"
            />

            <Text style={styles.inputLabel}>세부 사항</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 컴퓨터개론"
              value={newCategory}
              onChangeText={setNewCategory}
              placeholderTextColor="gray"
            />

            <View style={styles.createButtonsRow}>
              <Pressable
                style={[styles.createButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.createButton, styles.saveButton]}
                onPress={handleCreateProject}
              >
                <Text style={styles.saveButtonText}>생성</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ✅ 기존 / 생성된 프로젝트 카드들 (눌렀을 때 PlanAI로 이동) */}
        {projects.map((project) => (
          <Pressable
            key={project.id}
            style={styles.taskCard}
            onPress={() => handlePressProject(project)}
          >
            <Text style={styles.taskCategory}>{project.category}</Text>
            <Text style={styles.taskTitle}>{project.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f6ff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
  },
  bellButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  // 🔹 캘린더 대신 들어가는 프로젝트 추가 버튼
  addProjectButton: {
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#7c5cff',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addProjectText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  addProjectSubText: {
    fontSize: 13,
    color: '#f0eaff',
  },

  // Task 리스트
  list: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  taskCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },

  // 🔹 생성 카드 스타일 추가
  createCard: {
    borderWidth: 1,
    borderColor: '#ece5ff',
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  inputLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  createButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  createButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#eeeeff',
  },
  saveButton: {
    backgroundColor: '#7c5cff',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#555',
  },
  saveButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
