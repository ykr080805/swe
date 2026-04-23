import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { getAvailableCourses, enrollCourse, dropCourse } from '../../services/apiService';
import api from '../../services/authService';

export default function CourseRegistration() {
  const [available, setAvailable] = useState([]);
  const [enrolled, setEnrolled] = useState([]);

  useEffect(() => {
    getAvailableCourses().then(r => setAvailable(r.data)).catch(() => {});
    api.get('/enrollment').then(r => setEnrolled(r.data)).catch(() => {});
  }, []);

  const handleEnroll = async (courseOfferingId) => {
    try {
      await enrollCourse(courseOfferingId);
      alert('Enrolled!');
      api.get('/enrollment').then(r => setEnrolled(r.data));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll');
    }
  };

  const handleDrop = async (courseOfferingId) => {
    if (!confirm('Drop this course?')) return;
    try {
      await dropCourse(courseOfferingId);
      alert('Dropped!');
      api.get('/enrollment').then(r => setEnrolled(r.data));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to drop');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#2c3e50]">Course Registration</h1>

      <Card>
        <h3 className="font-bold text-gray-900 mb-3">My Enrolled Courses ({enrolled.length})</h3>
        {enrolled.length === 0 ? <p className="text-gray-500 text-sm">Not enrolled in any courses.</p> : (
          <div className="space-y-2">
            {enrolled.map(e => (
              <div key={e._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{e.courseOffering?.course?.name || 'Course'}</span>
                  <span className={`ml-3 px-2 py-0.5 rounded text-xs ${e.status === 'enrolled' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{e.status}</span>
                </div>
                {e.status === 'enrolled' && (
                  <Button variant="danger" onClick={() => handleDrop(e.courseOffering?._id || e.courseOffering)}>Drop</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-gray-900 mb-3">Available Courses</h3>
        <Card className="p-0 overflow-hidden">
          <Table headers={['Course', 'Faculty', 'Seats', 'Action']} data={available}
            renderRow={(c) => (
              <>
                <td className="px-6 py-4 font-medium text-gray-900">{c.course?.name || 'Course'} ({c.course?.code})</td>
                <td className="px-6 py-4">{c.faculty?.name || '--'}</td>
                <td className="px-6 py-4">{c.enrolledCount || 0}/{c.capacity || '∞'}</td>
                <td className="px-6 py-4">
                  <Button onClick={() => handleEnroll(c._id)}>Enroll</Button>
                </td>
              </>
            )}
          />
        </Card>
      </Card>
    </div>
  );
}
