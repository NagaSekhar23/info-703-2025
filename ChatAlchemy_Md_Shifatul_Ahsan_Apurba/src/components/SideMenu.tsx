import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Plus, MessageSquare, Edit2, Trash2, X, Check, Upload, Database, ChevronLeft } from 'lucide-react';
import { Chat } from '../types';
import { getAllChats, deleteChat, renameChat } from '../lib/storage';
import { FileUpload } from './FileUpload';

interface SideMenuProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onFileUpload: (filename: string) => void;
  onUploadError: (error: string) => void;
  loadedFiles: string[];
  onClearData: () => void;
  darkMode: boolean;
}

export function SideMenu({
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onFileUpload,
  onUploadError,
  loadedFiles,
  onClearData,
  darkMode
}: SideMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setChats(getAllChats());
  }, [currentChatId]);

  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingChatId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleNewChat = () => {
    onNewChat();
    setIsOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId);
    setIsOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChat(chatId);
    setChats(getAllChats());
  };

  const handleStartRenaming = (e: React.MouseEvent, chatId: string, currentName: string) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setNewChatName(currentName);
  };

  const handleRenameChat = (chatId: string) => {
    if (newChatName.trim()) {
      renameChat(chatId, newChatName.trim());
      setChats(getAllChats());
    }
    setEditingChatId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleRenameChat(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-md ${
          darkMode 
            ? 'text-gray-300 hover:bg-gray-700' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed inset-y-0 left-0 w-80 z-50 ${
                darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'
              } shadow-xl flex flex-col h-screen overflow-hidden`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Chat Alchemy
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-full ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <button
                  onClick={handleNewChat}
                  className={`w-full flex items-center gap-2 p-3 rounded-md mb-6 ${
                    darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">New Chat</span>
                </button>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Data Sources
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {loadedFiles.length > 0 
                            ? `${loadedFiles.length} file(s) loaded` 
                            : 'No files loaded'}
                        </span>
                      </div>
                      {loadedFiles.length > 0 && (
                        <button
                          onClick={onClearData}
                          className={`text-xs px-2 py-1 rounded ${
                            darkMode 
                              ? 'text-red-400 hover:bg-red-900/20' 
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div>
                      <FileUpload
                        onUploadComplete={onFileUpload}
                        onError={onUploadError}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Your Chats
                  </h3>
                  {chats.length === 0 ? (
                    <div className={`p-4 rounded-md border ${
                      darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No saved chats yet. Create a new chat to get started.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {chats.map(chat => (
                        <li key={chat.id}>
                          <div
                            onClick={() => handleSelectChat(chat.id)}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                              chat.id === currentChatId
                                ? darkMode 
                                  ? 'bg-gray-700 text-white' 
                                  : 'bg-purple-100 text-purple-700'
                                : darkMode 
                                  ? 'hover:bg-gray-700 text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <MessageSquare className="h-5 w-5 flex-shrink-0" />
                              
                              {editingChatId === chat.id ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    ref={inputRef}
                                    type="text"
                                    value={newChatName}
                                    onChange={(e) => setNewChatName(e.target.value)}
                                    onKeyDown={(e) => handleRenameKeyDown(e, chat.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`text-sm p-1 rounded flex-1 ${
                                      darkMode 
                                        ? 'bg-gray-600 text-white border-gray-500' 
                                        : 'bg-white text-gray-800 border-gray-300'
                                    } border`}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRenameChat(chat.id);
                                    }}
                                    className={`p-1 rounded ${
                                      darkMode 
                                        ? 'hover:bg-gray-600 text-green-400' 
                                        : 'hover:bg-gray-200 text-green-600'
                                    }`}
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-sm font-medium truncate">{chat.name}</span>
                              )}
                            </div>
                            
                            {editingChatId !== chat.id && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleStartRenaming(e, chat.id, chat.name)}
                                  className={`p-1 rounded opacity-70 hover:opacity-100 ${
                                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                                  }`}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteChat(e, chat.id)}
                                  className={`p-1 rounded opacity-70 hover:opacity-100 ${
                                    darkMode 
                                      ? 'hover:bg-gray-600 text-red-400' 
                                      : 'hover:bg-gray-200 text-red-500'
                                  }`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Chat Alchemy v1.0
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}