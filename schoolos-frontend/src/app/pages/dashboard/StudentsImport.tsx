import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";
import { api } from "../../services/api";

const NAVY = "#0A2472";
const PRIMARY = "#0A2472";
const MUTED = "#6B7280";
const DANGER = "#EF4444";
const SUCCESS = "#10B981";

interface ParsedStudent {
  student_id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  gender: string;
  parent_phone: string;
}

export function StudentsImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedStudent[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    window.location.href = 'http://localhost:5000/api/school/students/template';
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      setErrors(["File contains no data or is missing headers."]);
      return;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['student_id', 'first_name', 'last_name', 'other_names', 'date_of_birth', 'gender', 'class_name', 'enrollment_date', 'parent_name', 'parent_phone', 'parent_whatsapp', 'parent_email', 'address', 'previous_school', 'boarding_status'];
    
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      return;
    }

    const parsedData: ParsedStudent[] = [];
    const parseErrs: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, index) => {
        row[h] = values[index];
      });

      if (!row.first_name || !row.last_name || !row.class_name) {
        parseErrs.push(`Row ${i + 1}: Missing required name or class.`);
      } else {
        parsedData.push({
          student_id: row.student_id || '',
          first_name: row.first_name,
          last_name: row.last_name,
          class_name: row.class_name,
          gender: row.gender || '',
          parent_phone: row.parent_phone || ''
        });
      }
    }

    setPreview(parsedData);
    setErrors(parseErrs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(["Please upload a valid CSV file."]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setPreview([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        parseCSV(event.target.result as string);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrors([]);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.upload<{ errors?: string[]; imported?: number }>('/api/school/students/import', formData);
      if (res.data?.errors) {
        setErrors(res.data.errors);
      } else {
        setUploadSuccess(true);
      }
    } catch (err: any) {
      setErrors([err.message]);
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <PageTemplate title="Import Students" breadcrumb={[{ label: "Students", href: "/dashboard/students" }, { label: "Import" }]}>
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200 mt-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful</h2>
          <p className="text-gray-500 mb-6">Your students have been successfully imported and added to the registry.</p>
          <button onClick={() => navigate('/dashboard/students')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">
            View Students
          </button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Import Students"
      description="Upload student data via NaCCA CSV template"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Students", href: "/dashboard/students" },
        { label: "Import" },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">1. Download Template</h3>
            <p className="text-sm text-gray-500 mb-4">
              Use the official NaCCA format to ensure your student records are compliant.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 w-full justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <Download size={16} />
              Download CSV Template
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">2. Upload Data</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload your completed template. We'll preview the data before finalizing.
            </p>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="mx-auto text-gray-400 mb-3" size={24} />
                <p className="text-sm font-medium text-gray-700">Click to browse or drag file here</p>
                <p className="text-xs text-gray-500 mt-1">CSV files only</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPreview([]); setErrors([]); }} className="text-gray-400 hover:text-red-500">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Data Preview</h3>
              {preview.length > 0 && (
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  {preview.length} valid rows
                </span>
              )}
            </div>
            
            <div className="flex-1 p-0 overflow-hidden">
              {errors.length > 0 && (
                <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Validation Errors</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {preview.length === 0 && errors.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  Upload a file to see preview
                </div>
              ) : preview.length > 0 ? (
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Admission No.</th>
                        <th className="px-4 py-3">First Name</th>
                        <th className="px-4 py-3">Last Name</th>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Parent Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 50).map((row, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="px-4 py-3 text-gray-600">{row.student_id || '-'}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{row.first_name}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{row.last_name}</td>
                          <td className="px-4 py-3 text-gray-600">{row.class_name}</td>
                          <td className="px-4 py-3 text-gray-600">{row.parent_phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 50 && (
                    <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                      Showing first 50 rows. All {preview.length} rows will be imported.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={preview.length === 0 || isUploading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isUploading ? "Importing..." : "Confirm & Import"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
