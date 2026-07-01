import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { chatAPI, staffAPI } from '../lib/api.js'

function Chat() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const currentUserId = user?.userId || user?.id
  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin'

  // Data states
  const [conversations, setConversations] = useState([])
  const [contactList, setContactList] = useState([]) // generic list of contacts: { userId, fullName, email, role }
  const [selectedUser, setSelectedUser] = useState(null) // The user we are chatting with: { userId, fullName, email }
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  // UI states
  const [loadingConv, setLoadingConv] = useState(true)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [searchContact, setSearchContact] = useState('')

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    loadConversations()
    loadContactList()
  }, [isAuthenticated])

  // Scroll to bottom whenever messages list updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Polling for new messages in the active conversation
  useEffect(() => {
    if (!selectedUser) return

    const fetchActiveMessages = async () => {
      try {
        const conversation = await chatAPI.getConversation(selectedUser.userId)
        setMessages(prev => {
          if (prev.length !== conversation.length) {
            chatAPI.markConversationAsRead(selectedUser.userId).catch(() => {})
            return conversation
          }
          const hasChanges = conversation.some((msg, idx) => {
            const prevMsg = prev[idx]
            return !prevMsg || prevMsg.messageId !== msg.messageId
          })
          if (hasChanges) {
            chatAPI.markConversationAsRead(selectedUser.userId).catch(() => {})
            return conversation
          }
          return prev
        })
      } catch (err) {
        console.warn('Failed to poll chat messages:', err)
      }
    }

    const intervalId = setInterval(fetchActiveMessages, 3000)
    return () => clearInterval(intervalId)
  }, [selectedUser])

  const loadConversations = async () => {
    try {
      setLoadingConv(true)
      const data = await chatAPI.getConversations()
      setConversations(data || [])
    } catch (err) {
      console.error('Failed to load conversations:', err)
      setConversations([])
    } finally {
      setLoadingConv(false)
    }
  }

  const loadContactList = async () => {
    try {
      if (isStaffOrAdmin) {
        // Staff/Admin sees customers to chat with
        const customers = await staffAPI.getCustomers()
        const formatted = (customers || []).map(c => ({
          userId: c.user_id,
          fullName: c.full_name || 'Khách hàng',
          email: c.email || '',
          role: 'customer'
        }))
        setContactList(formatted)
      } else {
        // Customer sees staff/admin to chat with
        const staff = await chatAPI.getStaffList()
        setContactList(staff || [])
      }
    } catch (err) {
      console.error('Failed to load contact list:', err)
      setContactList([])
    }
  }

  const handleSelectConversation = async (conv) => {
    const otherUser = {
      userId: conv.otherUserId,
      fullName: conv.otherUserName,
      email: conv.otherUserEmail
    }
    setSelectedUser(otherUser)
    try {
      const conversation = await chatAPI.getConversation(otherUser.userId)
      setMessages(conversation || [])
      await chatAPI.markConversationAsRead(otherUser.userId).catch(() => {})
      // Refresh conversations list to clear unread states on UI
      loadConversations()
    } catch (err) {
      console.error('Failed to load conversation details:', err)
      setMessages([])
    }
  }

  const handleStartNewChat = async (contact) => {
    const otherUser = {
      userId: contact.userId,
      fullName: contact.fullName,
      email: contact.email
    }
    setSelectedUser(otherUser)
    setShowNewChatModal(false)
    setMessages([])
    try {
      const conversation = await chatAPI.getConversation(otherUser.userId)
      setMessages(conversation || [])
      await chatAPI.markConversationAsRead(otherUser.userId).catch(() => {})
      loadConversations()
    } catch (err) {
      console.error('Failed to load conversation:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    const textToSend = newMessage.trim()
    setNewMessage('')
    try {
      const sentMsg = await chatAPI.sendMessage(selectedUser.userId, textToSend)
      setMessages(prev => [...prev, sentMsg])
      loadConversations() // Reload conversations list to update last message
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!')
      setNewMessage(textToSend)
    }
  }

  const filteredContactList = contactList.filter(c => 
    (c.fullName || '').toLowerCase().includes(searchContact.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchContact.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">💬 Trò chuyện hỗ trợ</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition-colors"
          >
            Nhắn tin mới
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md flex-1 flex overflow-hidden min-h-[500px] h-[calc(100vh-220px)] border border-gray-200">
          {/* Left panel: Conversation List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <span className="font-semibold text-gray-700 text-sm">Hội thoại gần đây</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loadingConv ? (
                <div className="p-8 text-center text-gray-500">Đang tải cuộc hội thoại...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm">Chưa có hội thoại nào.</p>
                  <p className="text-xs text-gray-400 mt-1">Nhấp "Nhắn tin mới" để bắt đầu.</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = selectedUser?.userId === conv.otherUserId
                  return (
                    <div
                      key={conv.conversationId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col ${
                        isSelected ? 'bg-green-50 border-l-4 border-green-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900 text-sm">{conv.otherUserName}</span>
                        <span className="text-xs text-gray-400">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {conv.lastMessageSenderId === currentUserId ? 'Bạn: ' : ''}
                          {conv.lastMessageText || 'Chưa có tin nhắn'}
                        </p>
                        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-semibold uppercase">
                          {conv.otherUserRole === 'admin' ? 'Admin' : conv.otherUserRole === 'customer' ? 'Khách' : 'N.Viên'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right panel: Chat messages */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">💬 {selectedUser.fullName}</h3>
                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Message display area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <p className="text-4xl mb-2">💬</p>
                      <p className="text-sm font-medium">Bắt đầu cuộc hội thoại</p>
                      <p className="text-xs mt-1">Gửi tin nhắn bên dưới để liên hệ</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = String(msg.senderId) === String(currentUserId)
                      return (
                        <div
                          key={msg.messageId || msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isMe
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                            }`}
                          >
                            <p className="text-[10px] font-semibold mb-1 opacity-75">
                              {isMe ? 'Bạn' : msg.senderName || (isStaffOrAdmin ? 'Khách hàng' : 'Hỗ trợ')}
                            </p>
                            <p className="text-sm break-words">{msg.messageText}</p>
                            <p className={`text-[9px] mt-1 text-right ${
                              isMe ? 'text-green-100' : 'text-gray-400'
                            }`}>
                              {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <p className="text-5xl mb-3">💬</p>
                <p className="text-base font-semibold">Chưa chọn cuộc hội thoại</p>
                <p className="text-sm text-gray-400 mt-1">
                  {isStaffOrAdmin 
                    ? "Chọn một khách hàng bên trái hoặc bắt đầu nhắn tin mới" 
                    : "Chọn một người hỗ trợ bên trái hoặc bắt đầu nhắn tin mới"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col max-h-[500px]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="font-bold text-gray-800">
                {isStaffOrAdmin ? "Chọn khách hàng trò chuyện" : "Chọn nhân viên hỗ trợ"}
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-150">
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder={isStaffOrAdmin ? "Tìm kiếm khách hàng..." : "Tìm kiếm nhân viên..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
              {filteredContactList.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  {isStaffOrAdmin ? "Không tìm thấy khách hàng nào" : "Không tìm thấy nhân viên nào"}
                </p>
              ) : (
                filteredContactList.map((contact) => (
                  <div
                    key={contact.userId}
                    onClick={() => handleStartNewChat(contact)}
                    className="p-3 hover:bg-green-50 cursor-pointer rounded-lg transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{contact.fullName}</p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 capitalize">
                      {contact.role === 'admin' ? 'Admin' : contact.role === 'staff' ? 'N.Viên' : 'Khách'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
