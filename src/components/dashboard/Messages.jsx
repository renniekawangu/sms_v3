function Messages() {
  const messages = [
    { sender: 'Alex Campbell', message: 'Just wanted to check in...', time: '2:26 PM' },
    { sender: 'Mrs. Patel', message: 'Please review the report', time: '10:32 AM' },
  ]

  return (
    <div className="bg-card-white rounded-custom shadow-custom p-6">
      <h2 className="text-lg font-semibold text-text-dark mb-6">Messages</h2>
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {msg.sender
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-text-dark text-sm">{msg.sender}</h3>
                <span className="text-xs text-text-muted">{msg.time}</span>
              </div>
              <p className="text-sm text-text-muted truncate">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Messages
