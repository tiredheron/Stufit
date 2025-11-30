// examDummyPlans.ts

import { Plan } from "../../components/SubjectGroups";

export const DUMMY_EXAM_PLANS: Plan[] = [
  {
    plan_id: "exam-001",
    title: "Deep Learning Final Exam",
    description: "핵심 딥러닝 시험 대비 종합 복습",
    dailyPlans: [
      {
        daily_id: "exam-001-day1",
        title: "Day 1 — CNN Review",
        todos: [
          {
            todo_id: "exam-001-day1-1",
            title: "CNN 구조 전체 복습",
            content: "Convolution, Padding, Stride, Pooling, Fully-connected",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
          {
            todo_id: "exam-001-day1-2",
            title: "VGG / ResNet 아키텍처 비교",
            content: "논문 핵심 포인트 요약 및 차이점 정리",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
        ],
      },
      {
        daily_id: "exam-001-day2",
        title: "Day 2 — RNN & LSTM",
        todos: [
          {
            todo_id: "exam-001-day2-1",
            title: "RNN 기초",
            content: "Vanishing Gradient, BPTT 설명",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
          {
            todo_id: "exam-001-day2-2",
            title: "LSTM/GRU 수식 암기",
            content: "Forget/Input/Output gate 흐름정리",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
        ],
      },
      {
        daily_id: "exam-001-day3",
        title: "Day 3 — Transformer",
        todos: [
          {
            todo_id: "exam-001-day3-1",
            title: "Attention 완전정복",
            content: "Scaled Dot-Product & Multi-Head Attention",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
          {
            todo_id: "exam-001-day3-2",
            title: "Positional Encoding 정리",
            content: "sin/cos 포뮬러 암기",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
          {
            todo_id: "exam-001-day3-3",
            title: "BERT/LLM 비교",
            content: "Encoder vs Decoder 기반 차이",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
        ],
      },
    ],
  },

  {
    plan_id: "exam-002",
    title: "Computer Vision Exam",
    description: "객체 탐지/세그멘테이션 집중 대비",
    dailyPlans: [
      {
        daily_id: "exam-002-day1",
        title: "Day 1 — Object Detection",
        todos: [
          {
            todo_id: "exam-002-day1-1",
            title: "YOLO vs SSD 구조 차이",
            content: "Anchor box / Feature map 흐름",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
          {
            todo_id: "exam-002-day1-2",
            title: "NMS 알고리즘",
            content: "IoU 계산 및 최종 bounding box 선택",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
        ],
      },
      {
        daily_id: "exam-002-day2",
        title: "Day 2 — Segmentation",
        todos: [
          {
            todo_id: "exam-002-day2-1",
            title: "U-Net 구조 복습",
            content: "Encoder-Decoder skip connection 역할",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
          {
            todo_id: "exam-002-day2-2",
            title: "Mask R-CNN 분석",
            content: "RoIAlign, mask branch 동작 방식",
            accumulated_time: 0,
            status_id: "NOT_STARTED",
            files: [],
          },
        ],
      },
    ],
  },
];

export default function ExamDummyPlans() {
  return null;
}
