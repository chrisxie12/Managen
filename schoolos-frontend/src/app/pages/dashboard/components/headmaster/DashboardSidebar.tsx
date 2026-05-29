import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { X, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { getInitials, getCurrentTerm } from '../../../../utils/formatters';

interface NavItem {
  label: string;
  icon: string;
  path?: string;
  children?: { label: string; path: string }[];
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'MAIN NAVIGATION',
    items: [{ label: 'Dashboard', icon: '🏠', path: '/dashboard' }],
  },
  {
    label: 'MANAGEMENT',
    items: [
      {
        label: 'Finance & Fees', icon: '💰',
        children: [
          { label: 'Collect Fees', path: '/finance/collect' },
          { label: 'Search Due Fees', path: '/finance/search-dues' },
          { label: 'Fee Groups', path: '/finance/fee-groups' },
          { label: 'Fee Types', path: '/finance/fee-types' },
          { label: 'Assign Fees', path: '/finance/assign' },
          { label: 'All Transactions', path: '/finance/transactions' },
          { label: 'Online Payments', path: '/finance/online' },
        ],
      },
      {
        label: 'Accounts', icon: '🏦',
        children: [
          { label: 'Bank Accounts', path: '/accounts/banks' },
          { label: 'Income Heads', path: '/accounts/income-heads' },
          { label: 'Expense Heads', path: '/accounts/expense-heads' },
          { label: 'Income', path: '/accounts/income' },
          { label: 'Expense', path: '/accounts/expense' },
        ],
      },
      {
        label: 'Student Information', icon: '👨‍🎓',
        children: [
          { label: 'Student Admission', path: '/students/admission' },
          { label: 'Student List', path: '/students' },
          { label: 'Student Categories', path: '/students/categories' },
          { label: 'Student Houses', path: '/students/houses' },
          { label: 'Disabled Students', path: '/students/disabled' },
          { label: 'Bulk Import', path: '/bulk-import' },
          { label: 'Custom Fields', path: '/students/custom-fields' },
          { label: 'Behavior Records', path: '/students/behavior' },
        ],
      },
      {
        label: 'Academics', icon: '📚',
        children: [
          { label: 'Classes', path: '/classes' },
          { label: 'Sections', path: '/academics/sections' },
          { label: 'Subjects', path: '/academics/subjects' },
          { label: 'Assign Class Teacher', path: '/academics/assign-teacher' },
          { label: 'Assign Subjects', path: '/academics/assign-subjects' },
          { label: 'Class Timetable', path: '/timetable-scheduler' },
          { label: 'Promote Students', path: '/students/promote' },
        ],
      },
      {
        label: 'Front Office', icon: '🏢',
        children: [
          { label: 'Admission Enquiries', path: '/front-office/enquiries' },
          { label: 'Visitor Book', path: '/front-office/visitors' },
          { label: 'Complaints', path: '/front-office/complaints' },
          { label: 'Postal Records', path: '/operations/postal' },
          { label: 'Call Log', path: '/front-office/call-log' },
        ],
      },
      {
        label: 'Offline Examinations', icon: '📝',
        children: [
          { label: 'Manage Exams', path: '/exams' },
          { label: 'Exam Types', path: '/exams/types' },
          { label: 'Schedule & Marks Setup', path: '/exams/schedule' },
          { label: 'Enter Marks', path: '/gradebook' },
          { label: 'Manage Grades', path: '/exams/grades' },
          { label: 'Marksheet Generator', path: '/exams/marksheet' },
          { label: 'Report Card Setup', path: '/exams/report-card-setup' },
          { label: 'Generate Report Card', path: '/report-cards' },
        ],
      },
      {
        label: 'CBC Academics', icon: '📚',
        children: [
          { label: 'NaCCA Gradebook', path: '/gradebook' },
          { label: 'Competency Scores', path: '/gradebook/competency' },
          { label: 'CBC Report Cards', path: '/report-cards' },
          { label: 'Strand Management', path: '/gradebook/strands' },
        ],
      },
      {
        label: 'Online Examinations', icon: '💻',
        children: [
          { label: 'Manage Online Exams', path: '/exams/online' },
          { label: 'Question Bank', path: '/exams/question-bank' },
        ],
      },
      {
        label: 'Human Resource', icon: '👔',
        children: [
          { label: 'Staff Directory', path: '/staff' },
          { label: 'Departments', path: '/hr/departments' },
          { label: 'Designations', path: '/hr/designations' },
          { label: 'Staff Attendance', path: '/attendance' },
          { label: 'Payroll', path: '/hr/payroll' },
          { label: 'Approve Leave', path: '/hr/leave' },
          { label: 'Leave Types', path: '/hr/leave-types' },
        ],
      },
    ],
  },
  {
    label: 'MODULES',
    items: [
      {
        label: 'Study Center', icon: '📖',
        children: [
          { label: 'Manage Syllabus', path: '/academics/syllabus' },
          { label: 'Study Materials', path: '/academics/materials' },
          { label: 'Homework & Assignments', path: '/academics/homework' },
          { label: 'Live Classes', path: '/academics/live' },
        ],
      },
      {
        label: 'Certificates', icon: '📜',
        children: [
          { label: 'Certificate Templates', path: '/certificates/templates' },
          { label: 'Generate Certificate', path: '/certificates/generate' },
          { label: 'Student ID Card', path: '/certificates/student-id' },
          { label: 'Staff ID Card', path: '/certificates/staff-id' },
        ],
      },
      {
        label: 'Communicate', icon: '📢',
        children: [
          { label: 'Notice Board', path: '/communication' },
          { label: 'Broadcast', path: '/communication/broadcast' },
          { label: 'Broadcast History', path: '/communication/history' },
          { label: 'Event Calendar', path: '/calendar' },
        ],
      },
      {
        label: 'Library', icon: '📚',
        children: [
          { label: 'Issue / Return Books', path: '/library' },
          { label: 'Manage Books', path: '/library/books' },
          { label: 'Book Categories', path: '/library/categories' },
        ],
      },
      {
        label: 'Inventory', icon: '📦',
        children: [
          { label: 'Item Category', path: '/inventory/categories' },
          { label: 'Item List', path: '/inventory/items' },
          { label: 'Add Stock', path: '/inventory/add-stock' },
          { label: 'Issue Item', path: '/inventory/issue' },
          { label: 'Suppliers', path: '/inventory/suppliers' },
        ],
      },
      {
        label: 'Transport', icon: '🚌',
        children: [
          { label: 'Manage Vehicles', path: '/transport/vehicles' },
          { label: 'Manage Routes', path: '/transport/routes' },
          { label: 'Student Assignment', path: '/transport/assignments' },
          { label: 'Live Tracking', path: '/transport/tracking' },
        ],
      },
      {
        label: 'Hostel', icon: '🏠',
        children: [
          { label: 'Manage Hostels', path: '/hostel/manage' },
          { label: 'Room Types', path: '/hostel/room-types' },
          { label: 'Manage Rooms', path: '/hostel/rooms' },
          { label: 'Allocations', path: '/hostel/allocations' },
        ],
      },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      {
        label: 'Reports', icon: '📊',
        children: [
          { label: 'Student Report', path: '/reports/students' },
          { label: 'Guardian Report', path: '/reports/guardians' },
          { label: 'Admission Report', path: '/reports/admissions' },
          { label: 'Fees Statement', path: '/reports/fees-statement' },
          { label: 'Balance Fees Report', path: '/reports/balance-fees' },
          { label: 'Fees Collection Report', path: '/reports/fees-collection' },
          { label: 'Income / Expense Report', path: '/reports/income-expense' },
          { label: 'Monthly Attendance Report', path: '/reports/attendance' },
          { label: 'Staff Attendance Report', path: '/reports/staff-attendance' },
          { label: 'Rank Report', path: '/reports/rank' },
          { label: 'Class Performance Report', path: '/reports/class-performance' },
          { label: 'Book Issue Report', path: '/reports/book-issues' },
          { label: 'Stock Report', path: '/reports/stock' },
          { label: 'Transport Report', path: '/reports/transport' },
          { label: 'Hostel Report', path: '/reports/hostel' },
        ],
      },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { label: 'School Settings', icon: '⚙️', path: '/settings/school' },
      { label: 'Module Settings', icon: '🔧', path: '/settings/modules' },
      { label: 'Roles & Permissions', icon: '👥', path: '/roles' },
      { label: 'Payment Gateway', icon: '💳', path: '/settings/payments' },
      { label: 'Notification Settings', icon: '🔔', path: '/settings/notifications' },
      { label: 'Admission Settings', icon: '🎓', path: '/settings/admissions' },
      { label: 'Biometric Devices', icon: '👆', path: '/settings/biometric' },
      { label: 'Backup Management', icon: '💾', path: '/settings/backup' },
      { label: 'Audit Trail', icon: '📋', path: '/audit-logs' },
      { label: 'Subscription', icon: '💰', path: '/settings/subscription' },
      { label: 'Subscription History', icon: '📜', path: '/settings/subscription-history' },
    ],
  },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { school, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['Dashboard']));

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => {
      const next = new Set<string>();
      if (prev.has(label)) {
        prev.delete(label);
        return prev;
      }
      next.add(label);
      return next;
    });
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/dashboard/headmaster';
    return location.pathname.startsWith(path);
  };

  const filteredSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.children?.some(c => c.label.toLowerCase().includes(q))) return true;
      return false;
    }),
  })).filter(s => s.items.length > 0);

  const schoolName = school?.name || 'School';
  const initials = getInitials(schoolName);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 bg-[#1e1e2d] ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${open ? 'w-[240px]' : 'w-[240px] lg:w-[64px]'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            {open && (
              <div className="truncate">
                <div className="text-white text-xs font-semibold truncate">{schoolName}</div>
                <div className="text-[10px] text-white/40 truncate">{getCurrentTerm()}</div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search Menu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 text-white text-xs rounded-md pl-8 pr-3 py-1.5 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
          {filteredSections.map(section => (
            <div key={section.label} className="mb-3">
              {open && (
                <div className="text-[9px] uppercase tracking-widest text-white/40 px-3 py-2 font-semibold">
                  {section.label}
                </div>
              )}
              {section.items.map(item => {
                const hasChildren = item.children && item.children.length > 0;
                const expanded = expandedMenus.has(item.label);
                const active = isActive(item.path);

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleMenu(item.label);
                        } else if (item.path) {
                          navigate(item.path);
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
                        active
                          ? 'bg-[#1a6b4a] text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      } ${open ? '' : 'justify-center'}`}
                      title={item.label}
                    >
                      <span className="text-sm flex-shrink-0">{item.icon}</span>
                      {open && (
                        <>
                          <span className="flex-1 text-left text-[11px] font-medium truncate">{item.label}</span>
                          {hasChildren && (
                            <ChevronDown
                              size={12}
                              className={`transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
                            />
                          )}
                        </>
                      )}
                    </button>
                    {open && hasChildren && expanded && (
                      <div className="ml-7 mt-0.5 space-y-0.5">
                        {item.children!.map(child => (
                          <button
                            key={child.path}
                            onClick={() => { navigate(child.path); onClose(); }}
                            className={`w-full text-left px-3 py-1 rounded text-[11px] transition-all ${
                              isActive(child.path)
                                ? 'text-white bg-white/10 border-l-2 border-green-500'
                                : 'text-white/40 hover:text-white/70'
                            }`}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 px-3 py-3 space-y-2">
          {open && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-600 text-white">
                  Pro Plan
                </span>
              </div>
              <button className="text-[10px] text-white/40 hover:text-white/70 block">
                Help & Support
              </button>
              <div className="text-[9px] text-white/20">v2.0</div>
            </>
          )}
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `}</style>
      </aside>
    </>
  );
}
