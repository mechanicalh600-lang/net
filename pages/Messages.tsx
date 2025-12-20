import React, { useState, useEffect } from 'react';
import { User, Message, UserRole } from '../types';
import { getMyMessages, getSentMessages, sendInternalMessage, markMessageAsRead } from '../workflowStore';
import { MessageSquare, Send, Inbox, Upload, Check, CheckCheck, Users, Globe, User as UserIcon } from 'lucide-react';

interface Props {
  user: User;
}

const MOCK_USERS: {id: string, name: string}[] = [
    { id: '1', name: 'مدیر سیستم' },
    { id: '2', name: 'مدیر فنی' },
    { id: '3', name: 'سرپرست مکانیک' },
    { id: '4', name: 'کارشناس برق' },
];

export const Messages: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'INBOX' | 'SENT' | 'COMPOSE'>('INBOX');
  const [inboxMsgs, setInboxMsgs] = useState<Message[]>([]);
  const [sentMsgs, setSentMsgs] = useState<Message[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  // Compose State
  const [receiverType, setReceiverType] = useState<'USER' | 'GROUP' | 'ALL'>('USER');
  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
      refreshMessages();
  }, [user, activeTab]);

  const refreshMessages = () => {
      setInboxMsgs(getMyMessages(user));
      setSentMsgs(getSentMessages(user.id));
  };

  const handleReadMessage = (msg: Message) => {
      setSelectedMsg(msg);
      if (activeTab === 'INBOX' && !msg.readBy.includes(user.id)) {
          markMessageAsRead(msg.id, user.id);
          // Update local state to reflect read status immediately
          setInboxMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, readBy: [...m.readBy, user.id] } : m));
      }
  };

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      
      let finalReceiverId = receiverId;
      if (receiverType === 'ALL') finalReceiverId = 'ALL';
      
      if (receiverType !== 'ALL' && !finalReceiverId) {
          alert('لطفا گیرنده را مشخص کنید');
          return;
      }

      sendInternalMessage(user, finalReceiverId, receiverType, subject, body);
      alert('پیام با موفقیت ارسال شد');
      setSubject('');
      setBody('');
      setReceiverId('');
      setActiveTab('SENT');
  };

  const getReadStatusIcon = (msg: Message) => {
      // For broadcast/group, it's hard to say "read by everyone", so we show double check if at least one person read it, else single check
      if (msg.readBy.length > 0) return <span title="خوانده شده"><CheckCheck className="w-4 h-4 text-blue-500" /></span>;
      return <span title="ارسال شده"><Check className="w-4 h-4 text-gray-400" /></span>;
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 p-4">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button 
                    onClick={() => { setActiveTab('COMPOSE'); setSelectedMsg(null); }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <Send className="w-4 h-4" /> ارسال پیام جدید
                </button>
            </div>
            <div className="p-2 space-y-1">
                <button 
                    onClick={() => { setActiveTab('INBOX'); setSelectedMsg(null); }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${activeTab === 'INBOX' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Inbox className="w-4 h-4" /> صندوق دریافت
                    </div>
                    {inboxMsgs.filter(m => !m.readBy.includes(user.id)).length > 0 && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                            {inboxMsgs.filter(m => !m.readBy.includes(user.id)).length}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => { setActiveTab('SENT'); setSelectedMsg(null); }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${activeTab === 'SENT' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" /> صندوق ارسال
                    </div>
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            
            {activeTab === 'COMPOSE' && (
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary"/> ارسال پیام جدید
                    </h2>
                    <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">نوع گیرنده</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setReceiverType('USER')} className={`flex-1 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${receiverType === 'USER' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>
                                        <UserIcon className="w-4 h-4"/> فرد
                                    </button>
                                    <button type="button" onClick={() => setReceiverType('GROUP')} className={`flex-1 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${receiverType === 'GROUP' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>
                                        <Users className="w-4 h-4"/> گروه
                                    </button>
                                    <button type="button" onClick={() => setReceiverType('ALL')} className={`flex-1 py-2 rounded-lg border text-sm flex items-center justify-center gap-1 ${receiverType === 'ALL' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>
                                        <Globe className="w-4 h-4"/> همه
                                    </button>
                                </div>
                            </div>
                            
                            {receiverType === 'USER' && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">انتخاب کاربر</label>
                                    <select 
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
                                        value={receiverId}
                                        onChange={e => setReceiverId(e.target.value)}
                                        required
                                    >
                                        <option value="">انتخاب کنید...</option>
                                        {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {receiverType === 'GROUP' && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">انتخاب گروه کاربری</label>
                                    <select 
                                        className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
                                        value={receiverId}
                                        onChange={e => setReceiverId(e.target.value)}
                                        required
                                    >
                                        <option value="">انتخاب کنید...</option>
                                        <option value={UserRole.ADMIN}>مدیران سیستم</option>
                                        <option value={UserRole.MANAGER}>مدیران فنی</option>
                                        <option value={UserRole.USER}>پرسنل اجرایی</option>
                                        <option value={UserRole.STOREKEEPER}>انبارداران</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">موضوع پیام <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary"
                                required
                                placeholder="عنوان پیام..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">متن پیام <span className="text-red-500">*</span></label>
                            <textarea 
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                className="w-full p-3 border rounded-lg h-40 bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-primary resize-none"
                                required
                                placeholder="متن پیام خود را بنویسید..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg hover:bg-red-800 transition flex items-center gap-2">
                                <Send className="w-5 h-5" /> ارسال پیام
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {(activeTab === 'INBOX' || activeTab === 'SENT') && (
                <div className="flex h-full">
                    {/* Message List */}
                    <div className={`${selectedMsg ? 'hidden md:block md:w-1/3 border-l dark:border-gray-700' : 'w-full'} overflow-y-auto`}>
                        {((activeTab === 'INBOX' ? inboxMsgs : sentMsgs).length === 0) && (
                            <div className="text-center p-10 text-gray-400">
                                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>هیچ پیامی یافت نشد</p>
                            </div>
                        )}
                        {(activeTab === 'INBOX' ? inboxMsgs : sentMsgs).map(msg => (
                            <div 
                                key={msg.id}
                                onClick={() => handleReadMessage(msg)}
                                className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition
                                    ${selectedMsg?.id === msg.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                    ${activeTab === 'INBOX' && !msg.readBy.includes(user.id) ? 'border-r-4 border-r-primary bg-gray-50/50' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm ${activeTab === 'INBOX' && !msg.readBy.includes(user.id) ? 'font-black text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                        {activeTab === 'INBOX' ? msg.senderName : `به: ${msg.receiverId === 'ALL' ? 'همه' : (msg.receiverType === 'GROUP' ? 'گروه ' + msg.receiverId : 'کاربر')}`}
                                    </span>
                                    <span className="text-xs text-gray-400">{msg.createdAt}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h4 className={`text-sm truncate ${activeTab === 'INBOX' && !msg.readBy.includes(user.id) ? 'font-bold' : 'text-gray-600'}`}>
                                        {msg.subject}
                                    </h4>
                                    {activeTab === 'SENT' && getReadStatusIcon(msg)}
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate">{msg.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Message Detail */}
                    {selectedMsg ? (
                        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900/50">
                            <div className="p-6 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold">{selectedMsg.subject}</h2>
                                    <button onClick={() => setSelectedMsg(null)} className="md:hidden text-sm text-blue-600">بازگشت</button>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                                        {selectedMsg.senderName[0]}
                                    </div>
                                    <div>
                                        <p><span className="font-bold">{selectedMsg.senderName}</span></p>
                                        <p className="text-xs opacity-70">{selectedMsg.createdAt}</p>
                                    </div>
                                </div>
                                {activeTab === 'SENT' && (
                                     <div className="mt-4 pt-3 border-t dark:border-gray-700 text-xs text-gray-500">
                                         گیرنده: {selectedMsg.receiverType === 'ALL' ? 'همه کاربران' : (selectedMsg.receiverType === 'GROUP' ? `گروه ${selectedMsg.receiverId}` : 'کاربر')}
                                         {selectedMsg.readBy.length > 0 && <span className="mr-2 text-green-600 flex items-center gap-1 inline-flex"><CheckCheck className="w-3 h-3"/> خوانده شده توسط {selectedMsg.readBy.length} نفر</span>}
                                     </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                                    {selectedMsg.body}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                            <p>جهت مشاهده متن، یک پیام را انتخاب کنید</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
