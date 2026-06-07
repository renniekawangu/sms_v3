// Mock API Service - follows api_contract.json exactly
// All endpoints return Promises that simulate API calls

// Mock data storage (simulated database)
const mockData = {
  students: [
    {
      student_id: 1,
      email: 'john.doe@school.com',
      name: 'John Doe',
      dob: '2010-05-15',
      sex: 'M',
      address: '123 Main St',
      phone: '+1234567890',
      date_of_join: '2020-01-10',
      parent_name: 'Jane Doe'
    },
    {
      student_id: 2,
      email: 'jane.smith@school.com',
      name: 'Jane Smith',
      dob: '2011-08-20',
      sex: 'F',
      address: '456 Oak Ave',
      phone: '+1234567891',
      date_of_join: '2020-01-10',
      parent_name: 'John Smith'
    },
    {
      student_id: 3,
      email: 'mike.johnson@school.com',
      name: 'Mike Johnson',
      dob: '2012-03-10',
      sex: 'M',
      address: '789 Pine Rd',
      phone: '+1234567892',
      date_of_join: '2021-01-15',
      parent_name: 'Mary Johnson'
    }
  ],
  teachers: [
    {
      teacher_id: 'teacher1',
      email: 'emily.chen@school.com',
      name: 'Dr. Emily Chen',
      dob: '1985-04-12',
      sex: 'F',
      address: '100 Teacher Lane',
      phone: '+1234567800',
      date_of_join: '2018-08-01'
    },
    {
      teacher_id: 'teacher2',
      email: 'robert.taylor@school.com',
      name: 'Prof. Robert Taylor',
      dob: '1980-07-25',
      sex: 'M',
      address: '200 Educator St',
      phone: '+1234567801',
      date_of_join: '2017-01-15'
    }
  ],
  accounts: [
    {
      accountant_id: 1,
      email: 'accountant@school.com',
      name: 'Financial Manager',
      phone: '+1234567900',
      date_of_join: '2019-01-01'
    }
  ],
  classrooms: [
    {
      _id: 'classroom1',
      grade: 7,
      section: 'A',
      teacher_id: 'teacher1',
      students: ['student1', 'student2']
    },
    {
      _id: 'classroom2',
      grade: 6,
      section: 'B',
      teacher_id: 'teacher2',
      students: ['student3']
    }
  ],
  subjects: [
    { subject_id: 1, name: 'Mathematics', grade: 7, description: 'Core math curriculum' },
    { subject_id: 2, name: 'Science', grade: 7, description: 'Science fundamentals' },
    { subject_id: 3, name: 'English', grade: 7, description: 'Language and literature' },
    { subject_id: 4, name: 'Mathematics', grade: 6, description: 'Core math curriculum' },
    { subject_id: 5, name: 'Science', grade: 6, description: 'Science fundamentals' }
  ],
  timetable: {
    1: [
      { day: 'Monday', time: '09:00', subject: 'Mathematics' },
      { day: 'Monday', time: '10:00', subject: 'Science' },
      { day: 'Tuesday', time: '09:00', subject: 'English' },
      { day: 'Wednesday', time: '09:00', subject: 'Mathematics' }
    ],
    2: [
      { day: 'Monday', time: '09:00', subject: 'Mathematics' },
      { day: 'Tuesday', time: '09:00', subject: 'Science' }
    ]
  },
  exams: [
    { exam_id: 1, name: 'Midterm Exam', date: '2024-03-15', type: 1 },
    { exam_id: 2, name: 'Final Exam', date: '2024-06-20', type: 2 }
  ],
  results: [
    { student_id: 1, exam_id: 1, subject_id: 1, marks: 85 },
    { student_id: 1, exam_id: 1, subject_id: 2, marks: 90 },
    { student_id: 2, exam_id: 1, subject_id: 1, marks: 78 },
    { student_id: 2, exam_id: 1, subject_id: 2, marks: 82 }
  ],
  attendance: [
    { user_id: 1, date: '2024-01-15', status: true },
    { user_id: 1, date: '2024-01-16', status: true },
    { user_id: 1, date: '2024-01-17', status: false },
    { user_id: 2, date: '2024-01-15', status: true },
    { user_id: 2, date: '2024-01-16', status: true },
    { user_id: 2, date: '2024-01-17', status: true }
  ],
  fees: [
    {
      fee_id: 1,
      student_id: 1,
      amount: 5000,
      term: 'Term 1',
      year: 2024,
      status: 'PAID'
    },
    {
      fee_id: 2,
      student_id: 2,
      amount: 5000,
      term: 'Term 1',
      year: 2024,
      status: 'UNPAID'
    }
  ],
  payments: [
    {
      payment_id: 1,
      fee_id: 1,
      amount_paid: 5000,
      payment_date: '2024-01-10',
      method: 'Cash'
    }
  ],
  expenses: [
    {
      expense_id: 1,
      category: 'Utilities',
      amount: 2000,
      date: '2024-01-05',
      description: 'Electricity bill'
    },
    {
      expense_id: 2,
      category: 'Supplies',
      amount: 1500,
      date: '2024-01-10',
      description: 'Office supplies'
    }
  ],
  issues: [
    {
      issue_id: 1,
      raised_by: 'student',
      type: 'Academic',
      details: 'Need help with mathematics',
      is_resolved: false
    },
    {
      issue_id: 2,
      raised_by: 'teacher',
      type: 'Administrative',
      details: 'Classroom equipment needed',
      is_resolved: false
    }
  ]
}

// Helper function to simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Auth API
export const authApi = {
  login: async (email, password) => {
    await delay()
    // Mock authentication - check against predefined users
    const mockUsers = {
      'admin@school.com': { password: 'admin123', role: 'admin', user_id: 1 },
      'emily.chen@school.com': { password: 'teacher123', role: 'teacher', user_id: 1 },
      'robert.taylor@school.com': { password: 'teacher123', role: 'teacher', user_id: 2 },
      'student@school.com': { password: 'student123', role: 'student', user_id: 1 },
      'accountant@school.com': { password: 'accounts123', role: 'accounts', user_id: 1 }
    }

    const user = mockUsers[email]
    if (user && user.password === password) {
      return {
        token: `mock_token_${Date.now()}`,
        role: user.role,
        user_id: user.user_id
      }
    }
    throw new Error('Invalid credentials')
  },

  logout: async () => {
    await delay()
    return { success: true }
  }
}

// Students API
export const studentsApi = {
  list: async () => {
    await delay()
    return mockData.students
  },

  get: async (student_id) => {
    await delay()
    const student = mockData.students.find(s => s.student_id === student_id)
    if (!student) throw new Error('Student not found')
    return student
  },

  create: async (data) => {
    await delay()
    const newId = Math.max(...mockData.students.map(s => s.student_id), 0) + 1
    const newStudent = { student_id: newId, ...data }
    mockData.students.push(newStudent)
    return newStudent
  },

  update: async (student_id, data) => {
    await delay()
    const index = mockData.students.findIndex(s => s.student_id === student_id)
    if (index === -1) throw new Error('Student not found')
    mockData.students[index] = { ...mockData.students[index], ...data }
    return mockData.students[index]
  },

  delete: async (student_id) => {
    await delay()
    const index = mockData.students.findIndex(s => s.student_id === student_id)
    if (index === -1) throw new Error('Student not found')
    mockData.students.splice(index, 1)
    return { success: true }
  }
}

// Teachers API
export const teachersApi = {
  list: async () => {
    await delay()
    return mockData.teachers
  },

  get: async (teacher_id) => {
    await delay()
    const teacher = mockData.teachers.find(t => t.teacher_id === teacher_id)
    if (!teacher) throw new Error('Teacher not found')
    return teacher
  },

  create: async (data) => {
    await delay()
    const newId = Math.max(...mockData.teachers.map(t => t.teacher_id), 0) + 1
    const newTeacher = { teacher_id: newId, ...data }
    mockData.teachers.push(newTeacher)
    return newTeacher
  },

  update: async (teacher_id, data) => {
    await delay()
    const index = mockData.teachers.findIndex(t => t.teacher_id === teacher_id)
    if (index === -1) throw new Error('Teacher not found')
    mockData.teachers[index] = { ...mockData.teachers[index], ...data }
    return mockData.teachers[index]
  },

  delete: async (teacher_id) => {
    await delay()
    const index = mockData.teachers.findIndex(t => t.teacher_id === teacher_id)
    if (index === -1) throw new Error('Teacher not found')
    mockData.teachers.splice(index, 1)
    return { success: true }
  }
}

// Accounts API
export const accountsApi = {
  list: async () => {
    await delay()
    return mockData.accounts
  },

  create: async (data) => {
    await delay()
    const newId = Math.max(...mockData.accounts.map(a => a.accountant_id), 0) + 1
    const newAccount = { accountant_id: newId, ...data }
    mockData.accounts.push(newAccount)
    return newAccount
  }
}

// Classrooms API
export const classroomsApi = {
  list: async () => {
    await delay()
    return mockData.classrooms
  },

  get: async (id) => {
    await delay()
    const classroom = mockData.classrooms.find(c => c.classroom_id === id)
    if (!classroom) throw new Error('Classroom not found')
    return classroom
  }
}

// Subjects API
export const subjectsApi = {
  list: async () => {
    await delay()
    return mockData.subjects
  }
}

// Timetable API
export const timetableApi = {
  getByClassroom: async (classroom_id) => {
    await delay()
    return mockData.timetable[classroom_id] || []
  }
}

// Attendance API
export const attendanceApi = {
  getByUser: async (user_id) => {
    await delay()
    return mockData.attendance.filter(a => a.user_id === user_id)
  },

  mark: async (data) => {
    await delay()
    const existingIndex = mockData.attendance.findIndex(
      a => a.user_id === data.user_id && a.date === data.date
    )
    if (existingIndex >= 0) {
      mockData.attendance[existingIndex] = data
    } else {
      mockData.attendance.push(data)
    }
    return data
  }
}

// Fees API
export const feesApi = {
  list: async () => {
    await delay()
    return mockData.fees
  },

  create: async (data) => {
    await delay()
    const newId = Math.max(...mockData.fees.map(f => f.fee_id), 0) + 1
    const newFee = { fee_id: newId, ...data }
    mockData.fees.push(newFee)
    return newFee
  }
}

// Payments API
export const paymentsApi = {
  create: async (data) => {
    await delay()
    const newId = Math.max(...mockData.payments.map(p => p.payment_id), 0) + 1
    const newPayment = { payment_id: newId, ...data }
    mockData.payments.push(newPayment)
    
    // Update fee status if fully paid
    const fee = mockData.fees.find(f => f.fee_id === data.fee_id)
    if (fee) {
      const totalPaid = mockData.payments
        .filter(p => p.fee_id === data.fee_id)
        .reduce((sum, p) => sum + p.amount_paid, 0)
      if (totalPaid >= fee.amount) {
        fee.status = 'PAID'
      }
    }
    
    return newPayment
  }
}

// Expenses API
export const expensesApi = {
  list: async () => {
    await delay()
    return mockData.expenses
  },

  create: async (data) => {
    await delay()
    const newId = Math.max(...mockData.expenses.map(e => e.expense_id), 0) + 1
    const newExpense = { expense_id: newId, ...data }
    mockData.expenses.push(newExpense)
    return newExpense
  }
}

// Issues API
export const issuesApi = {
  list: async () => {
    await delay()
    return mockData.issues
  },

  create: async (data) => {
    await delay()
    const newId = Math.max(...mockData.issues.map(i => i.issue_id), 0) + 1
    const newIssue = { issue_id: newId, ...data, is_resolved: false }
    mockData.issues.push(newIssue)
    return newIssue
  },

  resolve: async (issue_id) => {
    await delay()
    const issue = mockData.issues.find(i => i.issue_id === issue_id)
    if (!issue) throw new Error('Issue not found')
    issue.is_resolved = true
    return issue
  }
}