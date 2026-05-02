'use client'

import type { ExamReportCard as ExamReportCardData } from '../types/results.types'

const GRADE_SCALE = [
  { range: '90-100', grade: 'A+' },
  { range: '80-89', grade: 'A' },
  { range: '70-79', grade: 'B+' },
  { range: '60-69', grade: 'B' },
  { range: '50-59', grade: 'C+' },
  { range: '40-49', grade: 'C' },
  { range: '33-39', grade: 'D' },
  { range: 'Below 33', grade: 'F' },
]

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface Props {
  data: ExamReportCardData
}

export function ExamReportCard({ data }: Props) {
  const studentName = `${data.student.firstName} ${data.student.lastName}`.toUpperCase()
  const isSchool = data.student.campusType === 'PRIMARY_SCHOOL'
  const institutionType = isSchool ? 'School System' : 'College'
  const examTitle = `${data.examType.name.toUpperCase()} EXAMINATION, ${data.academicYear || new Date().getFullYear()}`
  const classInfo = [data.student.gradeName, data.student.programName].filter(Boolean).join(' — ')

  return (
    <div
      id="exam-report-card"
      style={{
        fontFamily: 'Courier New, monospace',
        fontSize: '10px',
        color: '#000',
        background: '#fff',
        width: '210mm',
        minHeight: '297mm',
        padding: '8mm 10mm',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* ── Watermark border text ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 4, left: 0, right: 0, textAlign: 'center', fontSize: '8px', letterSpacing: '3px', color: '#bbe', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>
          {data.student.campusName} &nbsp;·&nbsp; {institutionType} &nbsp;·&nbsp; {examTitle}
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {/* Logo box */}
          <div style={{ width: '48px', height: '48px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontWeight: 900, fontSize: '22px', lineHeight: 1 }}>F</span>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '1px' }}>
              {data.student.campusName.toUpperCase()}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>
              {institutionType.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '6px', border: '1.5px solid #000', display: 'inline-block', padding: '2px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
          (RESULT CARD)
        </div>
      </div>

      {/* ── Exam title ── */}
      <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '11px', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {examTitle}
      </div>
      <div style={{ textAlign: 'center', fontSize: '9px', letterSpacing: '2px', marginBottom: '12px' }}>
        {classInfo}
      </div>

      {/* ── Student info + photo ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', borderBottom: '1px solid #aaa', paddingBottom: '12px' }}>
        <div style={{ flex: 1, lineHeight: 1.9, fontSize: '10px' }}>
          <div><span style={{ display: 'inline-block', width: '130px' }}>Roll No.</span>: <strong>{data.student.rollNumber ?? '—'}</strong></div>
          <div><span style={{ display: 'inline-block', width: '130px' }}>Name of Candidate</span>: <strong>{studentName}</strong></div>
          {data.student.fatherName && (
            <div><span style={{ display: 'inline-block', width: '130px' }}>Son / Daughter of</span>: <strong>{data.student.fatherName.toUpperCase()}</strong></div>
          )}
          <div><span style={{ display: 'inline-block', width: '130px' }}>Class / Section</span>: <strong>{data.student.gradeName} — Section {data.student.sectionName}</strong></div>
          <div><span style={{ display: 'inline-block', width: '130px' }}>Institute</span>: <strong>{data.student.campusName.toUpperCase()}, {institutionType.toUpperCase()}</strong></div>
          <div><span style={{ display: 'inline-block', width: '130px' }}>Generated On</span>: <strong>{fmtDate(data.generatedAt)}</strong></div>
        </div>
        {/* Photo */}
        <div style={{ width: '80px', height: '100px', border: '1px solid #aaa', flexShrink: 0, overflow: 'hidden' }}>
          {data.student.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.student.photoUrl}
              alt="Student Photo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#aaa', textAlign: 'center', background: '#f5f5f5' }}>
              NO PHOTO
            </div>
          )}
        </div>
      </div>

      {/* ── Marks table caption ── */}
      <div style={{ fontSize: '9px', fontStyle: 'italic', marginBottom: '6px', color: '#444' }}>
        The detail of marks obtained by the candidate is as under:-
      </div>

      {/* ── Subjects table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '14px' }}>
        <thead>
          <tr style={{ background: '#e8f5e9' }}>
            <th style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700, width: '32px' }}>S.No</th>
            <th style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.5px' }}>SUBJECTS</th>
            <th style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700, width: '60px' }}>Max.<br/>Marks</th>
            <th style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700, width: '70px' }}>Marks<br/>Obtained</th>
            <th style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700, width: '70px' }}>Percentage<br/>Score</th>
            <th style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700, width: '60px' }}>Relative<br/>Grade</th>
            <th style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700, width: '70px' }}>Remarks /<br/>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.subjects.map((sub, i) => (
            <tr key={sub.subjectId} style={{ background: i % 2 === 0 ? '#fff' : '#f9fef9' }}>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>{sub.sn}</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px' }}>{sub.subjectName}</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', fontWeight: 600 }}>{sub.maxMarks}</td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}>
                {sub.isAbsent ? 'ABS' : (sub.obtainedMarks !== null ? sub.obtainedMarks : '—')}
              </td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center' }}>
                {sub.percentage !== null ? `${sub.percentage.toFixed(2)}` : '—'}
              </td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>
                {sub.grade ?? '—'}
              </td>
              <td style={{ border: '1px solid #bbb', padding: '5px 8px', textAlign: 'center', fontSize: '9px', color: sub.isAbsent ? '#dc2626' : (sub.obtainedMarks !== null && sub.maxMarks > 0 && (sub.obtainedMarks / sub.maxMarks) < 0.33 ? '#dc2626' : '#166534') }}>
                {sub.isAbsent ? 'ABSENT' : (sub.obtainedMarks !== null ? (sub.percentage !== null && sub.percentage >= 33 ? 'PASS' : 'FAIL') : '—')}
              </td>
            </tr>
          ))}
          {/* Totals row */}
          <tr style={{ background: '#e8f5e9', fontWeight: 700 }}>
            <td colSpan={2} style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'right', fontWeight: 700 }}>TOTAL</td>
            <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>{data.totalMaxMarks}</td>
            <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}>
              {data.totalObtainedMarks !== null ? data.totalObtainedMarks : '—'}
            </td>
            <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>
              {data.overallPercentage !== null ? `${data.overallPercentage.toFixed(2)}%` : '—'}
            </td>
            <td style={{ border: '1px solid #888', padding: '5px 8px', textAlign: 'center', fontWeight: 900, fontSize: '12px' }}>
              {data.overallGrade ?? '—'}
            </td>
            <td style={{ border: '1px solid #888', padding: '5px 8px' }} />
          </tr>
        </tbody>
      </table>

      {/* ── Summary text ── */}
      {data.totalObtainedMarks !== null && (
        <div style={{ fontSize: '10px', lineHeight: 1.8, marginBottom: '12px' }}>
          <div>
            The candidate secured <strong>{data.totalObtainedMarks}/{data.totalMaxMarks}</strong> marks and Grade <strong>{data.overallGrade ?? '—'}</strong>
          </div>
        </div>
      )}

      {/* ── Signature area ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', marginTop: '8px' }}>
        <div style={{ textAlign: 'center', fontSize: '9px' }}>
          <div style={{ borderTop: '1px solid #000', width: '160px', paddingTop: '4px', marginTop: '32px' }}>
            Class Teacher / Controller
          </div>
          <div style={{ marginTop: '10px' }}>Checked by: ___________</div>
        </div>
      </div>

      <div style={{ textAlign: 'right', fontSize: '9px', marginBottom: '12px', color: '#555' }}>
        Declaration On : {fmtDate(data.generatedAt)} &nbsp;&nbsp; Printed On : {fmtDate(new Date().toISOString())}
      </div>

      {/* ── Grade scale ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', marginBottom: '4px' }}>
        <thead>
          <tr style={{ background: '#c8e6c9' }}>
            <th colSpan={GRADE_SCALE.length} style={{ border: '1px solid #888', padding: '3px 8px', textAlign: 'center', fontWeight: 700, letterSpacing: '0.5px' }}>
              Percentile Scores &amp; Corresponding Letter Grades
            </th>
          </tr>
          <tr style={{ background: '#e8f5e9' }}>
            {GRADE_SCALE.map((g) => (
              <th key={g.range} style={{ border: '1px solid #bbb', padding: '3px 4px', textAlign: 'center', fontSize: '8px' }}>{g.range}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: '#fff' }}>
            {GRADE_SCALE.map((g) => (
              <td key={g.grade} style={{ border: '1px solid #bbb', padding: '3px 4px', textAlign: 'center', fontWeight: 700 }}>{g.grade}</td>
            ))}
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', fontSize: '8px', color: '#555', marginTop: '4px' }}>
        Errors &amp; Omissions are Excepted.
      </div>
    </div>
  )
}
