'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useLinkStudent } from '../hooks/useParents';
import { LinkStudentInput, Relationship } from '../types/parents.types';
import { Button, Select, Badge, SearchInput } from '@/components/ui';

interface StudentSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string | null;
}

export interface LinkStudentFormProps {
  parentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LinkStudentForm({ parentId, onSuccess, onCancel }: LinkStudentFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);

  const [relationship, setRelationship] = useState<Relationship>('FATHER');
  const [isPrimary, setIsPrimary] = useState('false');

  const { mutate, isPending } = useLinkStudent();

  // Debounced Search using native local API intercept bypassing strict hook limits
  useEffect(() => {
    if (!searchQuery.trim() || selectedStudent) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get<{ success: boolean; data: { data: StudentSearchResult[] } }>(
          `/students?search=${encodeURIComponent(searchQuery)}`
        );
        // The API returns paginated data inside data.data
        setSearchResults(res.data.data?.data || []);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedStudent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const payload: LinkStudentInput = {
      studentId: selectedStudent.id,
      relationship,
      isPrimary: isPrimary === 'true',
    };

    mutate(
      { parentId, data: payload },
      { onSuccess: () => onSuccess() }
    );
  };

  const relationshipOptions = [
    { label: 'Father', value: 'FATHER' },
    { label: 'Mother', value: 'MOTHER' },
    { label: 'Guardian', value: 'GUARDIAN' },
  ];

  const booleanOptions = [
    { label: 'No', value: 'false' },
    { label: 'Yes', value: 'true' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Student Combobox Emulation */}
      <div className="space-y-2 relative">
        <label className="text-sm font-medium text-[var(--text)]">Search Student</label>
        {!selectedStudent ? (
          <div>
            <SearchInput
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
            
            {searchQuery && (
              <div className="absolute z-10 top-full mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-sm text-[var(--text-muted)] text-center">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-[var(--surface-hover)] text-sm focus:outline-none transition-colors"
                        onClick={() => {
                          setSelectedStudent(student);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div className="font-semibold text-[var(--text)]">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Roll No: {student.rollNumber || 'Unassigned'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-[var(--text-muted)] text-center">No students found</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-xl bg-[var(--surface-container-low)]">
            <div>
              <div className="font-semibold text-[var(--text)] text-sm">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </div>
              <div className="flex gap-2 items-center mt-1">
                <Badge variant="neutral">Roll No: {selectedStudent.rollNumber || 'Unassigned'}</Badge>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStudent(null)}
              disabled={isPending}
            >
              Change
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Relationship"
          options={relationshipOptions}
          value={relationship}
          onChange={(e) => setRelationship(e.target.value as Relationship)}
          required
          disabled={!selectedStudent || isPending}
        />
        <Select
          label="Is Primary Contact"
          options={booleanOptions}
          value={isPrimary}
          onChange={(e) => setIsPrimary(e.target.value)}
          required
          disabled={!selectedStudent || isPending}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending} disabled={!selectedStudent}>
          Link Student
        </Button>
      </div>
    </form>
  );
}
