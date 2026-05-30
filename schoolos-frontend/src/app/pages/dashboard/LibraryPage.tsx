import { useState, useEffect } from "react";
import { Plus, Search, Download, BookOpen, BookMarked, AlertCircle, Users, X } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#031B4E";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const INFO = "#3B82F6";

type Category = "All" | "Textbooks" | "Fiction" | "Science" | "Mathematics" | "History" | "Reference";
type CheckoutStatus = "returned" | "overdue" | "active";

interface Book {
  id: string;
  title: string;
  author: string;
  category: Exclude<Category, "All">;
  copies: number;
  available: number;
  isbn: string;
}

interface Checkout {
  id: string;
  studentName: string;
  admissionNo: string;
  book: string;
  dueDate: string;
  status: CheckoutStatus;
}

const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Beautyful Ones Are Not Yet Born",
    author: "Ayi Kwei Armah",
    category: "Fiction",
    copies: 12,
    available: 8,
    isbn: "978-0-435-90002-1",
  },
  {
    id: "2",
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    category: "Fiction",
    copies: 20,
    available: 14,
    isbn: "978-0-385-47454-2",
  },
  {
    id: "3",
    title: "West African Senior School Certificate Mathematics",
    author: "S. A. Acquah",
    category: "Mathematics",
    copies: 40,
    available: 22,
    isbn: "978-9988-0-0102-3",
  },
  {
    id: "4",
    title: "New School Chemistry for West Africa",
    author: "Osei Yaw Ababio",
    category: "Science",
    copies: 35,
    available: 18,
    isbn: "978-9988-0-0210-5",
  },
  {
    id: "5",
    title: "Ghana: The Autobiography of Kwame Nkrumah",
    author: "Kwame Nkrumah",
    category: "History",
    copies: 8,
    available: 5,
    isbn: "978-0-901787-03-3",
  },
  {
    id: "6",
    title: "Integrated Science for Senior High Schools",
    author: "Tetteh & Acheampong",
    category: "Science",
    copies: 30,
    available: 11,
    isbn: "978-9988-0-0315-7",
  },
  {
    id: "7",
    title: "Government for Senior High Schools",
    author: "John Bing Quartey",
    category: "Textbooks",
    copies: 25,
    available: 17,
    isbn: "978-9988-0-0421-5",
  },
  {
    id: "8",
    title: "Oxford English Dictionary (Compact Edition)",
    author: "Oxford University Press",
    category: "Reference",
    copies: 5,
    available: 5,
    isbn: "978-0-19-861186-8",
  },
];

const mockCheckouts: Checkout[] = [
  {
    id: "c1",
    studentName: "Ama Owusu",
    admissionNo: "2024/001",
    book: "Things Fall Apart",
    dueDate: "2024-06-05",
    status: "active",
  },
  {
    id: "c2",
    studentName: "Kwesi Mensah",
    admissionNo: "2024/002",
    book: "New School Chemistry for West Africa",
    dueDate: "2024-05-28",
    status: "overdue",
  },
  {
    id: "c3",
    studentName: "Abena Boateng",
    admissionNo: "2024/003",
    book: "Ghana: The Autobiography of Kwame Nkrumah",
    dueDate: "2024-05-20",
    status: "returned",
  },
  {
    id: "c4",
    studentName: "Kofi Asante",
    admissionNo: "2024/004",
    book: "West African Senior School Certificate Mathematics",
    dueDate: "2024-06-10",
    status: "active",
  },
  {
    id: "c5",
    studentName: "Efua Darko",
    admissionNo: "2024/005",
    book: "The Beautyful Ones Are Not Yet Born",
    dueDate: "2024-05-15",
    status: "overdue",
  },
  {
    id: "c6",
    studentName: "Yaw Acheampong",
    admissionNo: "2024/006",
    book: "Integrated Science for Senior High Schools",
    dueDate: "2024-06-08",
    status: "active",
  },
];

const CATEGORIES: Category[] = ["All", "Textbooks", "Fiction", "Science", "Mathematics", "History", "Reference"];

const statusConfig: Record<CheckoutStatus, { label: string; color: string }> = {
  returned: { label: "Returned", color: SUCCESS },
  overdue: { label: "Overdue", color: DANGER },
  active: { label: "Active", color: INFO },
};

export function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [checkouts] = useState(mockCheckouts);
  const [loading, setLoading] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);
  const [addBookForm, setAddBookForm] = useState({ title: "", author: "", category: "", isbn: "", copies: "" });
  const [addBookLoading, setAddBookLoading] = useState(false);

  const fetchBooks = () => {
    setLoading(true);
    api.get<{ books: any[] }>('/api/school/library/books')
      .then((res) => {
        if (res.data?.books && res.data.books.length > 0) {
          const mapped: Book[] = res.data.books.map((b: any) => ({
            id: String(b.id),
            title: b.title || "",
            author: b.author || "",
            category: (b.category as Exclude<Category, "All">) || "Textbooks",
            copies: b.copies ?? 0,
            available: b.available ?? b.available_copies ?? 0,
            isbn: b.isbn || "",
          }));
          setBooks(mapped);
        }
      })
      .catch(() => {
        // keep mockBooks as fallback
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = () => {
    setAddBookLoading(true);
    api.post('/api/school/library/books', {
      title: addBookForm.title,
      author: addBookForm.author,
      category: addBookForm.category,
      isbn: addBookForm.isbn,
      copies: Number(addBookForm.copies),
    })
      .then(() => {
        setShowAddBook(false);
        setAddBookForm({ title: "", author: "", category: "", isbn: "", copies: "" });
        fetchBooks();
      })
      .catch((err) => {
        console.error("Failed to add book:", err);
      })
      .finally(() => setAddBookLoading(false));
  };

  const totalBooks = books.reduce((sum, b) => sum + b.copies, 0);
  const booksOut = books.reduce((sum, b) => sum + (b.copies - b.available), 0);
  const overdue = checkouts.filter((c) => c.status === "overdue").length;
  const members = 312;

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || book.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageTemplate
      title="Library"
      description="Manage books, checkouts and library membership"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Library" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
            style={{ background: "white", color: PRIMARY, border: `1px solid ${PRIMARY}30` }}
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAddBook(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white"
            style={{ background: PRIMARY }}
          >
            <Plus size={16} />
            Add Book
          </button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Books", value: totalBooks, icon: BookOpen, color: NAVY },
          { label: "Books Out", value: booksOut, icon: BookMarked, color: INFO },
          { label: "Overdue", value: overdue, icon: AlertCircle, color: DANGER },
          { label: "Members", value: members, icon: Users, color: SUCCESS },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-5 rounded-lg flex items-start gap-4"
            style={{ background: "white", border: `1px solid ${NAVY}20` }}
          >
            <div
              className="p-2.5 rounded-lg flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500 }}>{label}</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginTop: "0.25rem",
                }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Category Filter */}
      <div
        className="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{ background: "white", border: `1px solid ${NAVY}20` }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search size={16} style={{ color: MUTED, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm outline-none"
            style={{ color: NAVY }}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat ? `${PRIMARY}15` : "transparent",
                color: activeCategory === cat ? PRIMARY : MUTED,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${NAVY}20` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `${NAVY}08`, borderBottom: `1px solid ${NAVY}20` }}>
                {["Title & Author", "Category", "Copies", "Available", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr
                  key={book.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: `1px solid ${NAVY}10` }}
                >
                  <td className="px-5 py-3.5">
                    <div style={{ color: NAVY, fontWeight: 600 }}>{book.title}</div>
                    <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.15rem" }}>
                      {book.author}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: `${INFO}15`, color: INFO }}
                    >
                      {book.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: MUTED }}>
                    {book.copies}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      style={{
                        color: book.available === 0 ? DANGER : book.available <= 3 ? WARNING : SUCCESS,
                        fontWeight: 600,
                      }}
                    >
                      {book.available}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      disabled={book.available === 0}
                      className="text-xs font-medium px-3 py-1 rounded transition-colors"
                      style={{
                        color: book.available === 0 ? MUTED : PRIMARY,
                        background: book.available === 0 ? `${MUTED}10` : `${PRIMARY}15`,
                        cursor: book.available === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      {book.available === 0 ? "Unavailable" : "Checkout"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBooks.length === 0 && (
          <div className="py-12 text-center" style={{ color: MUTED }}>
            No books match your search.
          </div>
        )}
      </div>

      {/* Recent Checkouts Panel */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${NAVY}20` }}>
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${NAVY}15`, background: `${NAVY}05` }}
        >
          <h3 style={{ fontWeight: 600, color: NAVY }}>Recent Checkouts</h3>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: `${DANGER}15`, color: DANGER }}
          >
            {overdue} Overdue
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `${NAVY}08`, borderBottom: `1px solid ${NAVY}20` }}>
                {["Student", "Book", "Due Date", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checkouts.map((co) => {
                const { label, color } = statusConfig[co.status];
                return (
                  <tr
                    key={co.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{
                      borderBottom: `1px solid ${NAVY}10`,
                      background: co.status === "overdue" ? `${DANGER}05` : undefined,
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div style={{ color: NAVY, fontWeight: 500 }}>{co.studentName}</div>
                      <div style={{ color: MUTED, fontSize: "0.73rem" }}>{co.admissionNo}</div>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: MUTED }}>
                      {co.book}
                    </td>
                    <td
                      className="px-5 py-3.5"
                      style={{ color: co.status === "overdue" ? DANGER : MUTED }}
                    >
                      {co.dueDate}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${color}15`, color }}
                      >
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-4 rounded-lg"
        style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}20` }}
      >
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          {loading ? "Loading books..." : <>Showing <strong>{filteredBooks.length}</strong> of <strong>{books.length}</strong> books</>}
        </p>
      </div>

      {/* Add Book Modal */}
      {showAddBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowAddBook(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ color: NAVY, fontWeight: 700, fontSize: "1.1rem" }}>Add New Book</h2>
              <button onClick={() => setShowAddBook(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={18} style={{ color: MUTED }} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { key: "title", label: "Title", placeholder: "Book title" },
                { key: "author", label: "Author", placeholder: "Author name" },
                { key: "category", label: "Category", placeholder: "e.g. Fiction, Science..." },
                { key: "isbn", label: "ISBN", placeholder: "ISBN number" },
                { key: "copies", label: "Copies", placeholder: "Number of copies", type: "number" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: NAVY }}>{label}</label>
                  <input
                    type={type ?? "text"}
                    placeholder={placeholder}
                    value={(addBookForm as any)[key]}
                    onChange={(e) => setAddBookForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: `${NAVY}25`, color: NAVY }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddBook(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
                style={{ color: MUTED, borderColor: `${NAVY}20` }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddBook}
                disabled={addBookLoading || !addBookForm.title || !addBookForm.author}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{
                  background: addBookLoading ? `${PRIMARY}60` : PRIMARY,
                  cursor: addBookLoading ? "not-allowed" : "pointer",
                }}
              >
                {addBookLoading ? "Saving..." : "Add Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
