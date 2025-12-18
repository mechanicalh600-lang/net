export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  STOREKEEPER = 'STOREKEEPER',
  INSPECTOR = 'INSPECTOR'
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

// Master Data Interfaces
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

export interface Part {
  id: string;
  code: string;
  name: string;
  groupId: string;
  unit: string;
}

export interface WorkOrder {
  id: string;
  trackingCode: string; // W...
  equipmentId: string;
  requestDate: string; // Shamsi string
  requesterId: string;
  failureDescription: string;
  actionTaken?: string;
  startTime?: string;
  endTime?: string;
  downtime?: number; // minutes
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  attachments: string[];
}

export interface PartRequest {
  id: string;
  trackingCode: string; // P...
  requesterId: string;
  partId: string;
  quantity: number;
  workOrderId?: string;
  status: 'PENDING' | 'APPROVED' | 'DELIVERED';
  deliveryDate?: string;
}

export interface ChecklistItem {
  id: string;
  activityCardId: string;
  order: number;
  description: string;
}

export interface InspectionResult {
  id: string;
  trackingCode: string; // J...
  inspectorId: string;
  equipmentId: string; // Derived from plan
  date: string;
  items: {
    checklistItemId: string;
    status: 'OK' | 'NOK';
    description?: string;
    media?: string;
  }[];
}

export interface DashboardStat {
  name: string;
  value: number;
  color: string;
}

// New Modules
export interface TechnicalDocument {
  id: string;
  archiveCode: string;
  name: string;
  type: string;
  file?: string;
}

export interface MeetingMinutes {
  id: string;
  trackingCode: string; // G...
  meetingCode: string;
  name: string;
  subject: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string;
  decisions: string;
}

export interface TechnicalSuggestion {
  id: string;
  trackingCode: string; // H...
  suggesterId: string; // User ID
  suggestion: string;
  date: string;
}

export interface PurchaseRequest {
  id: string;
  trackingCode: string; // K...
  requesterId: string;
  requestNumber: string; // Manual Input
  date: string;
  location: 'HQ' | 'SITE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  quantity: number;
  unit: string;
  status: string;
  expertName: string;
}