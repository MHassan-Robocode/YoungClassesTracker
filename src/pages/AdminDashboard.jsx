import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [openClass, setOpenClass] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [transferModal, setTransferModal] = useState(null);
  const [newClassId, setNewClassId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [newTeacher, setNewTeacher] = useState({ name: "", email: "" });
  const [newClass, setNewClass] = useState({
    name: "",
    day: "",
    time: "",
    teacherEmail: "",
  });
  const [newStudent, setNewStudent] = useState({ name: "", classId: "" });

  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterClass, setFilterClass] = useState("");

  // Fetch users and classes
  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersList = usersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsers(usersList);

      const classesSnap = await getDocs(collection(db, "classes"));
      const classesList = classesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setClasses(classesList);
    };
    fetchData();
  }, []);

  // Fetch students per class
  const loadStudents = async (classId) => {
    if (studentsByClass[classId]) return;
    const studentsSnap = await getDocs(
      collection(db, "classes", classId, "students")
    );
    const studentsList = studentsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    setStudentsByClass((prev) => ({ ...prev, [classId]: studentsList }));
  };

const loadAllStudents = async () => {
  const promises = classes.map(async (c) => {
    const snap = await getDocs(collection(db, "classes", c.id, "students"));
    return snap.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
      classId: c.id,
      className: c.name,
    }));
  });

  const results = await Promise.all(promises);
  const all = results.flat();
  setAllStudents(all);
};

  // Add Teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email) return alert("All fields required");
    await addDoc(collection(db, "users"), {
      name: newTeacher.name,
      email: newTeacher.email,
      role: "teacher",
    });
    alert("Teacher added!");
    setNewTeacher({ name: "", email: "" });
  };

  // Add Class
  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.name || !newClass.teacherEmail)
      return alert("Please complete all fields");
    await addDoc(collection(db, "classes"), {
      name: newClass.name,
      day: newClass.day,
      time: newClass.time,
      teacherEmail: newClass.teacherEmail,
      currentLesson: 1,
      currentProject: 1,
    });
    alert("Class added!");
    setNewClass({ name: "", day: "", time: "", teacherEmail: "" });
  };

  // Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.classId)
      return alert("Please complete all fields");
    await addDoc(collection(db, "classes", newStudent.classId, "students"), {
      name: newStudent.name,
      projectsCompleted: [],
    });
    alert("Student added!");
    setNewStudent({ name: "", classId: "" });
  };

  // Remove Student
  const handleRemoveStudent = async (classId, studentId) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    await deleteDoc(doc(db, "classes", classId, "students", studentId));
    alert("Student removed.");
    loadAllStudents();
  };

  // Transfer Student
  const handleTransferStudent = async () => {
    if (!newClassId || !transferModal) return alert("Select a new class.");
    const { student, fromClassId } = transferModal;

    const newRef = collection(db, "classes", newClassId, "students");
    await addDoc(newRef, {
      name: student.name,
      projectsCompleted: student.projectsCompleted || [],
    });

    await deleteDoc(doc(db, "classes", fromClassId, "students", student.id));

    alert("Student transferred successfully!");
    setTransferModal(null);
    setNewClassId("");
    loadAllStudents();
  };

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filters for Classes tab
  const filteredClasses = classes.filter((c) => {
    const matchTeacher = !filterTeacher || c.teacherEmail === filterTeacher;
    const matchDay = !filterDay || c.day === filterDay;
    const matchClass =
      !filterClass ||
      c.name.toLowerCase().includes(filterClass.toLowerCase());
    return matchTeacher && matchDay && matchClass;
  });

  const clearFilters = () => {
    setFilterTeacher("");
    setFilterDay("");
    setFilterClass("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Dashboard" />

      <main className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b pb-2">
          <button
            onClick={() => setTab("dashboard")}
            className={`px-4 py-2 rounded-t-md font-medium ${
              tab === "dashboard"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTab("classes")}
            className={`px-4 py-2 rounded-t-md font-medium ${
              tab === "classes"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Classes
          </button>
          <button
            onClick={() => {
              setTab("students");
              loadAllStudents();
            }}
            className={`px-4 py-2 rounded-t-md font-medium ${
              tab === "students"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Students
          </button>
        </div>

        {/* ===== DASHBOARD TAB ===== */}
        {tab === "dashboard" && (
          <>
            {/* Add Teacher */}
            <form
              onSubmit={handleAddTeacher}
              className="mb-6 p-4 bg-white border rounded-lg shadow-sm"
            >
              <h3 className="font-semibold mb-3 text-lg">Add Teacher</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newTeacher.name}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, name: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newTeacher.email}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, email: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Teacher
                </button>
              </div>
            </form>

            {/* Add Class */}
            <form
              onSubmit={handleAddClass}
              className="mb-6 p-4 bg-white border rounded-lg shadow-sm"
            >
              <h3 className="font-semibold mb-3 text-lg">Add Class</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Class Name"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Day"
                  value={newClass.day}
                  onChange={(e) =>
                    setNewClass({ ...newClass, day: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Time"
                  value={newClass.time}
                  onChange={(e) =>
                    setNewClass({ ...newClass, time: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <select
                  value={newClass.teacherEmail}
                  onChange={(e) =>
                    setNewClass({ ...newClass, teacherEmail: e.target.value })
                  }
                  className="border p-2 rounded"
                >
                  <option value="">Select Teacher</option>
                  {users
                    .filter((u) => u.role === "teacher")
                    .map((t) => (
                      <option key={t.id} value={t.email}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 col-span-4 sm:col-span-1"
                >
                  Add Class
                </button>
              </div>
            </form>

            {/* Add Student */}
            <form
              onSubmit={handleAddStudent}
              className="mb-6 p-4 bg-white border rounded-lg shadow-sm"
            >
              <h3 className="font-semibold mb-3 text-lg">Add Student</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <select
                  value={newStudent.classId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, classId: e.target.value })
                  }
                  className="border p-2 rounded"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </>
        )}

        {/* ===== CLASSES TAB ===== */}
        {tab === "classes" && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-4 text-lg">All Classes</h3>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <select
                className="border p-2 rounded w-full sm:w-1/4"
                onChange={(e) => setFilterTeacher(e.target.value)}
                value={filterTeacher}
              >
                <option value="">Filter by Teacher</option>
                {users
                  .filter((u) => u.role === "teacher")
                  .map((t) => (
                    <option key={t.id} value={t.email}>
                      {t.name}
                    </option>
                  ))}
              </select>

              <select
                className="border p-2 rounded w-full sm:w-1/4"
                onChange={(e) => setFilterDay(e.target.value)}
                value={filterDay}
              >
                <option value="">Filter by Day</option>
                {[...new Set(classes.map((c) => c.day))].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search by class name..."
                className="border p-2 rounded w-full sm:w-1/3"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              />

              <button
                onClick={clearFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Clear
              </button>
            </div>

            {filteredClasses.length === 0 ? (
              <p className="text-gray-500">No classes match your filters.</p>
            ) : (
              filteredClasses.map((c) => (
                <div key={c.id} className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => {
                      setOpenClass(openClass === c.id ? null : c.id);
                      loadStudents(c.id);
                    }}
                  >
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <p className="text-sm text-gray-500">
                        Teacher:{" "}
                        {users.find((u) => u.email === c.teacherEmail)?.name ||
                          c.teacherEmail}
                      </p>
                      <p className="text-sm text-gray-400">
                        {c.day} | {c.time}
                      </p>
                    </div>
                    <button className="text-blue-600 text-sm font-medium">
                      {openClass === c.id ? "Hide" : "View Students"}
                    </button>
                  </div>

                  {openClass === c.id && (
                    <div className="mt-4 border-t pt-3 space-y-4">
                      <h4 className="font-semibold mb-2">Students</h4>
                      {(studentsByClass[c.id] || []).length === 0 ? (
                        <p className="text-gray-500">No students yet.</p>
                      ) : (
                        (studentsByClass[c.id] || []).map((s) => (
                          <div
                            key={s.id}
                            className="p-3 border rounded-lg bg-white"
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
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {isDone
                                      ? `✅ ${projectNum}`
                                      : `${projectNum}`}
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
              ))
            )}
          </div>
        )}

        {/* ===== STUDENTS TAB ===== */}
        {tab === "students" && (
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">All Students</h3>
              <input
                type="text"
                placeholder="🔍 Search by name or class..."
                className="border p-2 rounded w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredStudents.length === 0 ? (
              <p className="text-gray-500">No students found.</p>
            ) : (
              <table className="w-full border text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Class</th>
                    <th className="p-2 border">Progress</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="p-2 border">{s.name}</td>
                      <td className="p-2 border">{s.className}</td>
                      <td className="p-2 border">
                        {(s.projectsCompleted?.length || 0)}/10
                      </td>
                      <td className="p-2 border space-x-2">
                        <button
                          onClick={() => handleRemoveStudent(s.classId, s.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() =>
                            setTransferModal({
                              student: s,
                              fromClassId: s.classId,
                            })
                          }
                          className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== TRANSFER MODAL ===== */}
        {transferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-3">
                Transfer {transferModal.student.name}
              </h3>
              <select
                value={newClassId}
                onChange={(e) => setNewClassId(e.target.value)}
                className="border p-2 rounded w-full mb-4"
              >
                <option value="">Select new class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setTransferModal(null)}
                  className="px-3 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferStudent}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
