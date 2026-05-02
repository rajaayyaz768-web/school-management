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
        width: '100%',
        maxWidth: '210mm',
        padding: '6mm 8mm',
        boxSizing: 'border-box',
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {/* ── Watermark border text ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 2, left: 0, right: 0, textAlign: 'center', fontSize: '7px', letterSpacing: '3px', color: '#bbe', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>
          {data.student.campusName} &nbsp;·&nbsp; {institutionType} &nbsp;·&nbsp; {examTitle}
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '6px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {/* Logo box */}
          <div style={{ width: '42px', height: '42px', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontWeight: 900, fontSize: '20px', lineHeight: 1 }}>F</span>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '1px' }}>
              {data.student.campusName.toUpperCase()}
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', marginTop: '1px' }}>
              {institutionType.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '4px', border: '1.5px solid #000', display: 'inline-block', padding: '1px 14px', fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>
          (RESULT CARD)
        </div>
      </div>

      {/* ── Exam title ── */}
      <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '11px', letterSpacing: '0.5px', marginBottom: '2px' }}>
        {examTitle}
      </div>
      <div style={{ textAlign: 'center', fontSize: '9px', letterSpacing: '2px', marginBottom: '8px' }}>
        {classInfo}
      </div>

      {/* ── Student info + photo ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', borderBottom: '1px solid #aaa', paddingBottom: '8px' }}>
        <div style={{ flex: 1, lineHeight: 1.8, fontSize: '10px' }}>
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
        <div style={{ width: '72px', height: '90px', border: '1px solid #aaa', flexShrink: 0, overflow: 'hidden' }}>
          {data.student.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.student.photoUrl}
              alt="Student Photo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#aaa', textAlign: 'center', background: '#f5f5f5' }}>
              NO PHOTO
            </div>
          )}
        </div>
      </div>

      {/* ── Marks table caption ── */}
      <div style={{ fontSize: '9px', fontStyle: 'italic', marginBottom: '4px', color: '#444' }}>
        The detail of marks obtained by the candidate is as under:-
      </div>

      {/* ── Subjects table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '8px' }}>
        <thead>
          <tr style={{ background: '#e8f5e9' }}>
            <th style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '30px' }}>S.No</th>
            <th style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.5px' }}>SUBJECTS</th>
            <th style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '55px' }}>Max.<br/>Marks</th>
            <th style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '60px' }}>Marks<br/>Obtained</th>
            <th style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '65px' }}>Percentage<br/>Score</th>
            <th style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '55px' }}>Relative<br/>Grade</th>
            <th style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '60px' }}>Remarks /<br/>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.subjects.map((sub, i) => (
            <tr key={sub.subjectId} style={{ background: i % 2 === 0 ? '#fff' : '#f9fef9' }}>
              <td style={{ border: '1px solid #bbb', padding: '4px 6px', textAlign: 'center' }}>{sub.sn}</td>
              <td style={{ border: '1px solid #bbb', padding: '4px 6px' }}>{sub.subjectName}</td>
              <td style={{ border: '1px solid #bbb', padding: '4px 6px', textAlign: 'center', fontWeight: 600 }}>{sub.maxMarks}</td>
              <td style={{ border: '1px solid #bbb', padding: '4px 6px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}>
                {sub.isAbsent ? 'ABS' : (sub.obtainedMarks !== null ? sub.obtainedMarks : '—')}
              </td>
              <td style={{ border: '1px solid #bbb', padding: '4px 6px', textAlign: 'center' }}>
                {sub.percentage !== null ? `${sub.percentage.toFixed(2)}` : '—'}
              </td>
              <td style={{ border: '1px solid #bbb', padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>
                {sub.grade ?? '—'}
              </td>
              <td style={{ border: '1px solid #bbb', padding: '4px 6px', textAlign: 'center', fontSize: '9px', color: sub.isAbsent ? '#dc2626' : (sub.obtainedMarks !== null && sub.maxMarks > 0 && (sub.obtainedMarks / sub.maxMarks) < 0.33 ? '#dc2626' : '#166534') }}>
                {sub.isAbsent ? 'ABSENT' : (sub.obtainedMarks !== null ? (sub.percentage !== null && sub.percentage >= 33 ? 'PASS' : 'FAIL') : '—')}
              </td>
            </tr>
          ))}
          {/* Totals row */}
          <tr style={{ background: '#e8f5e9', fontWeight: 700 }}>
            <td colSpan={2} style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>TOTAL</td>
            <td style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>{data.totalMaxMarks}</td>
            <td style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700, fontSize: '11px' }}>
              {data.totalObtainedMarks !== null ? data.totalObtainedMarks : '—'}
            </td>
            <td style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>
              {data.overallPercentage !== null ? `${data.overallPercentage.toFixed(2)}%` : '—'}
            </td>
            <td style={{ border: '1px solid #888', padding: '4px 6px', textAlign: 'center', fontWeight: 900, fontSize: '12px' }}>
              {data.overallGrade ?? '—'}
            </td>
            <td style={{ border: '1px solid #888', padding: '4px 6px' }} />
          </tr>
        </tbody>
      </table>

      {/* ── Summary text ── */}
      {data.totalObtainedMarks !== null && (
        <div style={{ fontSize: '10px', lineHeight: 1.6, marginBottom: '6px' }}>
          The candidate secured <strong>{data.totalObtainedMarks}/{data.totalMaxMarks}</strong> marks and Grade <strong>{data.overallGrade ?? '—'}</strong>
        </div>
      )}

      {/* ── Signature area ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px', marginTop: '4px' }}>
        <div style={{ textAlign: 'center', fontSize: '9px' }}>
          <div style={{ borderTop: '1px solid #000', width: '150px', paddingTop: '3px', marginTop: '20px' }}>
            Class Teacher / Controller
          </div>
          <div style={{ marginTop: '6px' }}>Checked by: ___________</div>
        </div>
      </div>

      <div style={{ textAlign: 'right', fontSize: '9px', marginBottom: '8px', color: '#555' }}>
        Declaration On : {fmtDate(data.generatedAt)} &nbsp;&nbsp; Printed On : {fmtDate(new Date().toISOString())}
      </div>

      {/* ── Grade scale ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', marginBottom: '3px' }}>
        <thead>
          <tr style={{ background: '#c8e6c9' }}>
            <th colSpan={GRADE_SCALE.length} style={{ border: '1px solid #888', padding: '2px 6px', textAlign: 'center', fontWeight: 700, letterSpacing: '0.5px' }}>
              Percentile Scores &amp; Corresponding Letter Grades
            </th>
          </tr>
          <tr style={{ background: '#e8f5e9' }}>
            {GRADE_SCALE.map((g) => (
              <th key={g.range} style={{ border: '1px solid #bbb', padding: '2px 3px', textAlign: 'center', fontSize: '7.5px' }}>{g.range}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: '#fff' }}>
            {GRADE_SCALE.map((g) => (
              <td key={g.grade} style={{ border: '1px solid #bbb', padding: '2px 3px', textAlign: 'center', fontWeight: 700 }}>{g.grade}</td>
            ))}
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', fontSize: '7.5px', color: '#555', marginTop: '2px' }}>
        Errors &amp; Omissions are Excepted.
      </div>
    </div>
  )
}
