import { WorkflowDefinition, CartableItem, User, UserRole, WorkflowHistory, Message } from './types';
import { generateId, getShamsiDate } from './utils';

// --- Local Storage Helpers ---
const loadWorkflows = (): WorkflowDefinition[] => {
  try {
    const saved = localStorage.getItem('workflows');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveWorkflows = (workflows: WorkflowDefinition[]) => {
  localStorage.setItem('workflows', JSON.stringify(workflows));
};

const loadCartable = (): CartableItem[] => {
  try {
    const saved = localStorage.getItem('cartable');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveCartable = (items: CartableItem[]) => {
  localStorage.setItem('cartable', JSON.stringify(items));
};

// --- Documents Specific Helpers ---
export interface DocumentItem {
    id: string;
    code: string;
    name: string;
    type: string;
    fileName?: string;
    createdAt: string;
}

const loadDocuments = (): DocumentItem[] => {
    try {
        const saved = localStorage.getItem('documents');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
};

export const saveDocument = (doc: DocumentItem) => {
    const docs = loadDocuments();
    docs.push(doc);
    localStorage.setItem('documents', JSON.stringify(docs));
};

export const getAllDocuments = () => loadDocuments();

export const deleteDocument = (id: string) => {
    const docs = loadDocuments();
    const filtered = docs.filter(d => d.id !== id);
    localStorage.setItem('documents', JSON.stringify(filtered));
};

// --- Messaging Helpers ---
const loadMessages = (): Message[] => {
    try {
        const saved = localStorage.getItem('messages');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
};

const saveMessages = (msgs: Message[]) => {
    localStorage.setItem('messages', JSON.stringify(msgs));
};

export const sendInternalMessage = (sender: User, receiverId: string, subject: string, body: string) => {
    const msgs = loadMessages();
    const newMsg: Message = {
        id: generateId(),
        senderId: sender.id,
        senderName: sender.fullName,
        receiverId,
        subject,
        body,
        createdAt: getShamsiDate(),
        isRead: false
    };
    msgs.push(newMsg);
    saveMessages(msgs);
};

export const getMyMessages = (userId: string): Message[] => {
    const msgs = loadMessages();
    return msgs.filter(m => m.receiverId === userId || m.receiverId === 'ALL');
};

// --- Initialization Logic ---
const initDefaultWorkflow = () => {
    let workflows = loadWorkflows();
    if (!workflows.find(w => w.module === 'WORK_ORDER')) {
        const defaultWO: WorkflowDefinition = {
            id: 'default-wo-flow',
            module: 'WORK_ORDER',
            title: 'فرآیند استاندارد تعمیرات',
            isActive: true,
            steps: [
                {
                    id: 'step-request',
                    title: 'درخواست',
                    assigneeRole: 'INITIATOR',
                    description: 'ثبت درخواست توسط متقاضی',
                    actions: [
                        { id: 'act-submit', label: 'ارسال جهت انجام', nextStepId: 'step-inprogress', style: 'primary' }
                    ]
                },
                {
                    id: 'step-inprogress',
                    title: 'در حال انجام',
                    assigneeRole: UserRole.USER, 
                    description: 'دستور کار در کارتابل مجری',
                    actions: [
                        { id: 'act-finish', label: 'اتمام کار و ارسال به تایید', nextStepId: 'step-verify', style: 'success' }
                    ]
                },
                {
                    id: 'step-verify',
                    title: 'تایید',
                    assigneeRole: UserRole.MANAGER, 
                    description: 'بررسی کیفیت کار انجام شده',
                    actions: [
                        { id: 'act-approve', label: 'تایید نهایی', nextStepId: 'step-finish', style: 'success' },
                        { id: 'act-reject', label: 'عدم تایید (بازگشت به اجرا)', nextStepId: 'step-inprogress', style: 'danger' }
                    ]
                },
                {
                    id: 'step-finish',
                    title: 'اتمام',
                    assigneeRole: UserRole.ADMIN,
                    description: 'بایگانی درخواست',
                    actions: [
                        { id: 'act-close', label: 'بستن پرونده', nextStepId: 'FINISH', style: 'neutral' }
                    ]
                }
            ]
        };
        workflows.push(defaultWO);
        saveWorkflows(workflows);
    }
};

initDefaultWorkflow();

// --- Workflow Logic ---

export const getWorkflows = () => loadWorkflows();

export const saveWorkflowDefinition = (def: WorkflowDefinition) => {
  const workflows = loadWorkflows();
  const idx = workflows.findIndex(w => w.id === def.id);
  if (idx >= 0) {
    workflows[idx] = def;
  } else {
    workflows.push(def);
  }
  saveWorkflows(workflows);
};

export const startWorkflow = (
  module: string,
  data: any,
  user: User,
  trackingCode: string,
  title: string
): CartableItem | null => {
  const workflows = loadWorkflows();
  // Find active workflow for this module, OR create a dummy item if no workflow is defined (for simple lists)
  let workflow = workflows.find(w => w.module === module && w.isActive);
  
  // Create a default simple workflow for modules that don't have one defined yet
  if (!workflow) {
      workflow = {
          id: `dummy-${module}`,
          module,
          title: 'فرآیند پیش‌فرض',
          isActive: true,
          steps: [{ id: 'step-start', title: 'ثبت شده', assigneeRole: 'INITIATOR', actions: [] }]
      };
  }

  const firstStep = workflow.steps[0];

  const newItem: CartableItem = {
    id: generateId(),
    workflowId: workflow.id,
    trackingCode,
    module,
    title,
    description: `ایجاد شده توسط ${user.fullName}`,
    currentStepId: firstStep.id,
    initiatorId: user.id,
    assigneeRole: (firstStep.assigneeRole as string) === 'INITIATOR' ? user.role : (firstStep.assigneeRole as UserRole),
    status: 'PENDING',
    createdAt: getShamsiDate(),
    updatedAt: getShamsiDate(),
    data: { ...data, status: 'REQUEST' } 
  };

  const items = loadCartable();
  items.push(newItem);
  saveCartable(items);
  return newItem;
};

export const processWorkflowAction = (
  itemId: string,
  actionId: string,
  user: User,
  comment?: string
) => {
  const items = loadCartable();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const item = items[itemIndex];
  const workflows = loadWorkflows();
  const workflow = workflows.find(w => w.id === item.workflowId);
  if (!workflow) return;

  const currentStep = workflow.steps.find(s => s.id === item.currentStepId);
  if (!currentStep) return;

  const action = currentStep.actions.find(a => a.id === actionId);
  if (!action) return;

  if (action.nextStepId === 'FINISH') {
    item.status = 'DONE';
    item.assigneeRole = UserRole.ADMIN; 
    item.description = `پایان فرآیند توسط ${user.fullName}`;
    if (item.data) item.data.status = 'FINISHED'; 
  } else {
    const nextStep = workflow.steps.find(s => s.id === action.nextStepId);
    if (nextStep) {
      item.currentStepId = nextStep.id;
      
      const nextRole = nextStep.assigneeRole;
      if ((nextRole as string) === 'INITIATOR') {
          item.assigneeRole = UserRole.USER;
      } else {
          item.assigneeRole = nextRole as UserRole;
      }

      item.updatedAt = getShamsiDate();
      item.description = `ارجاع شده به ${nextStep.assigneeRole} توسط ${user.fullName}`;
      
      if (item.module === 'WORK_ORDER') {
          if (nextStep.title === 'درخواست') item.data.status = 'REQUEST';
          else if (nextStep.title === 'در حال انجام') item.data.status = 'IN_PROGRESS';
          else if (nextStep.title === 'تایید') item.data.status = 'VERIFICATION';
          else if (nextStep.title === 'اتمام') item.data.status = 'FINISHED';
      }
    }
  }

  items[itemIndex] = item;
  saveCartable(items);
};

export const getMyCartable = (user: User): CartableItem[] => {
  const items = loadCartable();
  return items.filter(item => 
    item.status === 'PENDING' && (
        item.assigneeRole === user.role || 
        ((item.assigneeRole as string) === 'INITIATOR' && item.initiatorId === user.id) ||
        item.assigneeId === user.id
    )
  );
};

export const getAllWorkOrders = (): CartableItem[] => {
    const items = loadCartable();
    return items.filter(item => item.module === 'WORK_ORDER');
};

export const getItemsByModule = (module: string): CartableItem[] => {
    const items = loadCartable();
    return items.filter(item => item.module === module);
};