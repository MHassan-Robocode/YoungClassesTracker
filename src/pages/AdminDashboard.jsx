import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [openClass, setOpenClass] = useState(null);

  // Form states
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "" });
  const [newClass, setNewClass] = useState({
    name: "",
    day: "",
    time: "",
    teacherEmail: "",
  });
  const [newStudent, setNewStudent] = useState({
    name: "",
    classId: "",
  });

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      const classSnap = await getDocs(collection(db, "classes"));
      const userSnap = await getDocs(collection(db, "users"));

      const allClasses = classSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const allTeachers = userSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === "teacher");

      setClasses(allClasses);
      setTeachers(allTeachers);

      // Load students for each class
      const studentData = {};
      for (let c of allClasses) {
        const studentSnap = await getDocs(
          collection(db, "classes", c.id, "students")
        );
        studentData[c.id] = studentSnap.docs.map((s) => ({
          id: s.id,
          ...s.data(),
        }));
      }
      setStudentsByClass(studentData);
    };

    fetchData();
  }, []);

  // ✅ Add Teacher
  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email)
      return alert("Please enter teacher name and email");
    try {
      await setDoc(doc(db, "users", newTeacher.email), {
        name: newTeacher.name,
        email: newTeacher.email,
        role: "teacher",
      });
      alert("✅ Teacher added");
      const snap = await getDocs(collection(db, "users"));
      const updated = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === "teacher");
      setTeachers(updated);
      setNewTeacher({ name: "", email: "" });
    } catch (err) {
      console.error("Error adding teacher:", err);
      alert("❌ Failed to add teacher. Check Firestore rules/config.");
    }
  };

  // ✅ Add Class
  const handleAddClass = async () => {
    if (!newClass.name || !newClass.teacherEmail)
      return alert("Please fill all fields");
    try {
      const ref = await addDoc(collection(db, "classes"), {
        ...newClass,
        currentProject: 1,
        currentLesson: 1,
      });
      alert("✅ Class added");
      setClasses((prev) => [...prev, { id: ref.id, ...newClass }]);
      setNewClass({ name: "", day: "", time: "", teacherEmail: "" });
    } catch (err) {
      console.error("Error adding class:", err);
      alert("❌ Failed to add class.");
    }
  };

  // ✅ Add Student
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.classId)
      return alert("Please fill all fields");
    try {
      const studentRef = collection(
        db,
        "classes",
        newStudent.classId,
        "students"
      );
      await addDoc(studentRef, { name: newStudent.name, projectsCompleted: [] });
      alert("✅ Student added");
      setStudentsByClass((prev) => {
        const updated = { ...prev };
        const list = updated[newStudent.classId] || [];
        updated[newStudent.classId] = [
          ...list,
          { name: newStudent.name, projectsCompleted: [] },
        ];
        return updated;
      });
      setNewStudent({ name: "", classId: "" });
    } catch (err) {
      console.error("Error adding student:", err);
      alert("❌ Failed to add student.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar title="Admin Dashboard" />
      <main className="max-w-5xl mx-auto p-6 text-gray-800 dark:text-gray-100">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {["dashboard", "classes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ---------------- DASHBOARD ---------------- */}
        {activeTab === "dashboard" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>

            {/* Add Teacher */}
            <section className="mb-8 border rounded-lg p-5 bg-white dark:bg-gray-900 shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Add Teacher</h3>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newTeacher.name}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, name: e.target.value })
                  }
                  className="border p-2 rounded w-40"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newTeacher.email}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, email: e.target.value })
                  }
                  className="border p-2 rounded w-60"
                />
                <button
                  onClick={handleAddTeacher}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                >
                  Add Teacher
                </button>
              </div>
            </section>

            {/* Add Class */}
            <section className="mb-8 border rounded-lg p-5 bg-white dark:bg-gray-900 shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Add Class</h3>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                  className="border p-2 rounded w-40"
                />
                <input
                  type="text"
                  placeholder="Day"
                  value={newClass.day}
                  onChange={(e) =>
                    setNewClass({ ...newClass, day: e.target.value })
                  }
                  className="border p-2 rounded w-32"
                />
                <input
                  type="text"
                  placeholder="Time"
                  value={newClass.time}
                  onChange={(e) =>
                    setNewClass({ ...newClass, time: e.target.value })
                  }
                  className="border p-2 rounded w-32"
                />
                <select
                  value={newClass.teacherEmail}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      teacherEmail: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-60"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.email}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddClass}
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  Add Class
                </button>
              </div>
            </section>

            {/* Add Student */}
            <section className="border rounded-lg p-5 bg-white dark:bg-gray-900 shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Add Student</h3>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="border p-2 rounded w-40"
                />
                <select
                  value={newStudent.classId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, classId: e.target.value })
                  }
                  className="border p-2 rounded w-60"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddStudent}
                  className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
                >
                  Add Student
                </button>
              </div>
            </section>
          </>
        )}

        {/* ---------------- CLASSES ---------------- */}
        {activeTab === "classes" && (
          <>
            <h2 className="text-2xl font-semibold mb-4">All Classes</h2>
            {classes.length === 0 ? (
              <p>No classes yet.</p>
            ) : (
              <div className="space-y-6">
                {classes.map((c) => (
                  <div
                    key={c.id}
                    className="border rounded-lg p-5 shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    {/* Header */}
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        setOpenClass(openClass === c.id ? null : c.id)
                      }
                    >
                      <div>
                        <h3 className="text-xl font-semibold">{c.name}</h3>
                        <p className="text-sm text-gray-500">
                          {c.day} {c.time} —{" "}
                          {c.teacherEmail || "No teacher assigned"}
                        </p>
                      </div>
                      <span className="text-blue-600">
                        {openClass === c.id ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Students */}
                    {openClass === c.id && (
                      <div className="mt-4 border-t pt-3 space-y-4">
                        <h4 className="font-semibold mb-2">Students</h4>
                        {(studentsByClass[c.id] || []).length === 0 ? (
                          <p className="text-gray-500">No students yet.</p>
                        ) : (
                          (studentsByClass[c.id] || []).map((s) => (
                            <div
                              key={s.id}
                              className="p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                            >
                              <p className="font-medium mb-2">{s.name}</p>
                              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                {[...Array(10)].map((_, i) => {
                                  const projectNum = i + 1;
                                  const isDone =
                                    s.projectsCompleted?.includes(projectNum);
                                  return (
                                    <div
                                      key={projectNum}
                                      className={`p-2 text-center text-sm font-medium rounded border ${
                                        isDone
                                          ? "bg-green-500 text-white border-green-600"
                                          : "bg-gray-100 dark:bg-gray-900 dark:border-gray-600 text-gray-600"
                                      }`}
                                    >
                                      {isDone ? `✅ ${projectNum}` : `${projectNum}`}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
