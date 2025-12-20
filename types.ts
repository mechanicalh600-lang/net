
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  STOREKEEPER = 'STOREKEEPER',
  INSPECTOR = 'INSPECTOR',
  MANAGER = 'MANAGER', // Added Manager
  EXPERT = 'EXPERT'    // Added Expert
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  passwordHash: string; // Simulated
  isDefaultPassword?: boolean;
  avatar?: string;
  personnelCode?: string;
}

export interface LogEntry {
  id: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT';
  timestamp: string;
  ip: string;
}

// --- Workflow Types ---
export interface WorkflowAction {
  id: string;
  label: string;
  nextStepId: string | 'FINISH';
  style: 'primary' | 'danger' | 'success' | 'neutral';
  requiredRole?: UserRole;
}

export interface WorkflowStep {
  id: string;
  title: string;
  assigneeRole: UserRole | 'INITIATOR'; // Who should perform this step
  description?: string;
  actions: WorkflowAction[];
}

export interface WorkflowDefinition {
  id: string;
  module: string; // 'WORK_ORDER', 'PROJECT', etc.
  title: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

export interface CartableItem {
  id: string;
  workflowId: string;
  trackingCode: string;
  module: string;
  title: string;
  description: string;
  currentStepId: string;
  initiatorId: string;
  assigneeRole: UserRole | 'INITIATOR';
  assigneeId?: string; // Optional: specific user assignment
  status: 'PENDING' | 'DONE' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  data: any; // The actual entity data (WorkOrder, Project, etc.)
}

export interface WorkflowHistory {
  id: string;
  cartableItemId: string;
  stepId: string;
  actorId: string;
  actionTaken: string;
  comment?: string;
  timestamp: string;
}

// --- Internal Messaging ---
export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string; // Could be userId, role name, or 'ALL'
    receiverType: 'USER' | 'GROUP' | 'ALL'; // Added to distinguish target
    subject: string;
    body: string;
    createdAt: string;
    readBy: string[]; // Array of user IDs who read the message
}

// --- Entity Types ---

export interface Location {
  id: string;
  code: string;
  name: string;
  parentId?: string;
}

export interface Equipment {
  id: string;
  code: string;
  name: string;
  localName: string;
  locationId: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  manager: string;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'HALTED';
  description: string;
}

export interface PerformanceScore {
  id: string;
  personnelId: string;
  period: string; // e.g., "1403-01"
  score: number; // 0-100
  criteria: { label: string; score: number; max: number }[];
  evaluatorId: string;
  notes?: string;
}

// Updated Statuses based on user request
export type WorkOrderStatus = 'REQUEST' | 'IN_PROGRESS' | 'VERIFICATION' | 'FINISHED';

export interface WorkOrder {
  id: string;
  trackingCode: string; 
  equipmentId: string;
  requestDate: string; 
  requesterId: string;
  failureDescription: string;
  actionTaken?: string;
  startTime?: string;
  endTime?: string;
  downtime?: number; 
  status: WorkOrderStatus; // Updated
  attachments: string[];
  [key: string]: any; // Allow flexibility for workflow data
}

export interface PartRequest { id: string; [key: string]: any; }
export interface ChecklistItem { id: string; activityCardId: string; order: number; description: string; }
export interface InspectionResult { id: string; [key: string]: any; }
export interface DashboardStat { name: string; value: number; color: string; }
export interface TechnicalDocument { id: string; [key: string]: any; }
export interface MeetingMinutes { id: string; [key: string]: any; }
export interface TechnicalSuggestion { id: string; [key: string]: any; }
export interface PurchaseRequest { id: string; [key: string]: any; }
