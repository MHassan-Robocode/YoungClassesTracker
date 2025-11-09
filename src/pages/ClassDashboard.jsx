import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function ClassDashboard() {
  const { user } = useAuth();
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [openClass, setOpenClass] = useState(null);
  const [students, setStudents] = useState({}); // store each class's students

  // Load classes assigned to this teacher
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      const q = query(
        collection(db, "classes"),
        where("teacherEmail", "==", user.email)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeacherClasses(data);
    };
    fetchClasses();
  }, [user]);

  // Load students for one class
  const toggleClass = async (classId) => {
    if (openClass === classId) {
      setOpenClass(null);
      return;
    }
    if (!students[classId]) {
      const studentsRef = collection(db, "classes", classId, "students");
      const snap = await getDocs(studentsRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents((prev) => ({ ...prev, [classId]: list }));
    }
    setOpenClass(classId);
  };

  // Toggle a student project completion
  const toggleProject = async (classId, studentId, projectNum) => {
    const list = students[classId] || [];
    const student = list.find((s) => s.id === studentId);
    if (!student) return;

    const docRef = doc(db, "classes", classId, "students", studentId);
    let updated = [...(student.projectsCompleted || [])];
    const isDone = updated.includes(projectNum);
    if (isDone) {
      updated = updated.filter((p) => p !== projectNum);
    } else {
      updated.push(projectNum);
    }

    await updateDoc(docRef, { projectsCompleted: updated });
    const updatedStudents = list.map((s) =>
      s.id === studentId ? { ...s, projectsCompleted: updated } : s
    );
    setStudents((prev) => ({ ...prev, [classId]: updatedStudents }));
  };

  // Calculate % complete for progress bar
  const calcProgress = (projectsCompleted) => {
    const done = projectsCompleted?.length || 0;
    return Math.round((done / 10) * 100);
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Teacher Dashboard" />
        <main className="p-6 text-gray-800 dark:text-gray-100">
          <h2 className="text-2xl font-semibold mb-6">👩‍🏫 My Classes</h2>

          {teacherClasses.length === 0 ? (
            <p className="text-gray-500">No classes assigned yet.</p>
          ) : (
            <div className="space-y-6">
              {teacherClasses.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-xl p-5 shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900 transition-all"
                >
                  {/* Class Header */}
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleClass(c.id)}
                  >
                    <div>
                      <h3 className="text-xl font-semibold">{c.name}</h3>
                      <p className="text-sm text-gray-500">
                        {c.day} {c.time}
                      </p>
                    </div>
                    <button
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {openClass === c.id ? "Hide Students ▲" : "View Students ▼"}
                    </button>
                  </div>

                  {/* Expand Students */}
                  {openClass === c.id && (
                    <div className="mt-5 border-t pt-4 space-y-4">
                      <h4 className="text-lg font-semibold mb-2">Students</h4>
                      {(students[c.id] || []).length === 0 ? (
                        <p className="text-gray-500">No students yet.</p>
                      ) : (
                        <div className="space-y-5">
                          {students[c.id].map((s) => {
                            const progress = calcProgress(s.projectsCompleted);
                            return (
                              <div
                                key={s.id}
                                className="border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <div>
                                    <h5 className="font-semibold">{s.name}</h5>
                                    <p className="text-xs text-gray-400">
                                      {progress}% complete
                                    </p>
                                  </div>
                                  <div className="w-32 bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Projects Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                  {[...Array(10)].map((_, i) => {
                                    const num = i + 1;
                                    const isDone =
                                      s.projectsCompleted?.includes(num);
                                    return (
                                      <div
                                        key={num}
                                        onClick={() =>
                                          toggleProject(c.id, s.id, num)
                                        }
                                        className={`p-2 text-center rounded border cursor-pointer transition-all ${
                                          isDone
                                            ? "bg-green-500 text-white border-green-600"
                                            : "bg-gray-100 dark:bg-gray-900 dark:border-gray-600"
                                        }`}
                                      >
                                        {isDone ? `✅ ${num}` : `⬜ ${num}`}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
