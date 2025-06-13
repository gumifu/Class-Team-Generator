"use client";

import { useState, useEffect } from "react";
import { Student } from "@/types/student";
import {
  Loader2,
  AlertCircle,
  Trash2,
  X,
  Plus,
  Play,
  Square,
  ChevronUp,
  ChevronDown,
  Download,
  Sun,
  Moon,
  Pencil,
} from "lucide-react";

const TEAM_COLORS = [
  { bg: "bg-red-500", text: "text-red-500" },
  { bg: "bg-blue-500", text: "text-blue-500" },
  { bg: "bg-green-500", text: "text-green-500" },
  { bg: "bg-yellow-500", text: "text-yellow-500" },
  { bg: "bg-purple-500", text: "text-purple-500" },
  { bg: "bg-pink-500", text: "text-pink-500" },
  { bg: "bg-indigo-500", text: "text-indigo-500" },
  { bg: "bg-orange-500", text: "text-orange-500" },
  { bg: "bg-teal-500", text: "text-teal-500" },
  { bg: "bg-cyan-500", text: "text-cyan-500" },
  { bg: "bg-red-600", text: "text-red-600" },
  { bg: "bg-blue-600", text: "text-blue-600" },
  { bg: "bg-green-600", text: "text-green-600" },
  { bg: "bg-yellow-600", text: "text-yellow-600" },
  { bg: "bg-purple-600", text: "text-purple-600" },
  { bg: "bg-pink-600", text: "text-pink-600" },
  { bg: "bg-indigo-600", text: "text-indigo-600" },
  { bg: "bg-orange-600", text: "text-orange-600" },
  { bg: "bg-teal-600", text: "text-teal-600" },
  { bg: "bg-cyan-600", text: "text-cyan-600" },
];

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState("");
  const [teamCount, setTeamCount] = useState(4);
  const [teams, setTeams] = useState<Student[][]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSuccessEmoji, setShowSuccessEmoji] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  const addStudent = () => {
    if (newName.trim() === "") return;
    const newStudent: Student = {
      id: Date.now(),
      name: newName.trim(),
      isPresent: true,
    };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setNewName("");

    setTimeout(() => {
      const studentList = document.querySelector(".custom-scrollbar");
      if (studentList) {
        studentList.scrollTop = studentList.scrollHeight;
      }
    }, 100);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.relatedTarget?.tagName === "BUTTON") return;

    const studentList = document.querySelector(".custom-scrollbar");
    if (studentList) {
      studentList.scrollTop = 0;
    }
  };

  const togglePresence = (id: number) => {
    const updatedStudents = students.map((student) =>
      student.id === id
        ? { ...student, isPresent: !student.isPresent }
        : student
    );
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
  };

  const deleteStudent = (id: number) => {
    const updatedStudents = students.filter((student) => student.id !== id);
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
  };

  const deleteAllStudents = () => {
    setStudents([]);
    localStorage.removeItem("students");
    setShowDeleteModal(false);
  };

  const startShuffling = () => {
    setIsShuffling(true);
    setShowSuccessEmoji(false);

    // 名簿の上部にスクロール
    const studentList = document.querySelector(".custom-scrollbar");
    if (studentList) {
      studentList.scrollTop = 0;
    }
  };

  const stopShuffling = () => {
    setIsShuffling(false);
    const presentStudents = students.filter((student) => student.isPresent);
    const shuffled = [...presentStudents].sort(() => Math.random() - 0.5);
    const newTeams: Student[][] = Array.from({ length: teamCount }, () => []);

    shuffled.forEach((student, index) => {
      const teamIndex = index % teamCount;
      newTeams[teamIndex].push(student);
    });

    setTeams(newTeams);
    setShowSuccessEmoji(true);
  };

  const handleExport = () => {
    if (teams.length === 0) return;

    const exportData = teams
      .map((team, index) => {
        const teamName = `Team ${String.fromCharCode(65 + index)}`;
        const members = team
          .map(
            (student, studentIndex) => `${studentIndex + 1}. ${student.name}`
          )
          .join("\n");
        return `${teamName}\n${members}`;
      })
      .join("\n\n");

    const blob = new Blob([exportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teams_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const presentStudentsCount = students.filter(
    (student) => student.isPresent
  ).length;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleEditName = (student: Student) => {
    setEditingStudentId(student.id);
    setEditingName(student.name);
  };

  const handleSaveEdit = (studentId: number) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, name: editingName } : student
      )
    );
    setEditingStudentId(null);
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, studentId: number) => {
    if (e.key === "Enter") {
      handleSaveEdit(studentId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (editingStudentId !== null) {
      const target = e.target as HTMLElement;
      if (!target.closest("li")) {
        handleCancelEdit();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingStudentId]);

  return (
    <>
      <main
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center">
              🎨🧑‍🎨
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 ml-4">
                Class Team Generator
              </span>
            </h1>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${
                isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-200"
              } transition-colors cursor-pointer`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 h-[calc(100vh-8rem)]">
            {/* Left Column - Input and Student List */}
            <div className="space-y-4 md:space-y-8">
              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-2xl shadow-lg p-4 md:p-6`}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                  Add Students
                </h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder={"Type name & Press Enter or Click Add"}
                    className={`flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-gray-50 text-gray-900"
                    } cursor-text`}
                    onKeyPress={(e) => e.key === "Enter" && addStudent()}
                  />
                  <button
                    onClick={addStudent}
                    className="px-4 md:px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                <div className="flex gap-4 items-center mb-4">
                  <label
                    htmlFor="teamCount"
                    className={`font-medium cursor-pointer ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Number of Teams:
                  </label>
                  <div className="relative">
                    <input
                      id="teamCount"
                      type="number"
                      min="1"
                      max="10"
                      value={teamCount}
                      onChange={(e) => setTeamCount(Number(e.target.value))}
                      className={`w-20 p-2 pr-8 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      } cursor-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                      <button
                        onClick={() =>
                          setTeamCount((prev) => Math.min(prev + 1, 10))
                        }
                        className={`${
                          isDarkMode
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        } cursor-pointer`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setTeamCount((prev) => Math.max(prev - 1, 1))
                        }
                        className={`${
                          isDarkMode
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        } cursor-pointer`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={startShuffling}
                    disabled={students.length < 2 || isShuffling}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isShuffling
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } ${
                      students.length < 2
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {isShuffling ? (
                      <>
                        <Square className="w-4 h-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Shuffling
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-2xl shadow-lg p-4 md:p-6`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-bold">
                    Student List
                  </h2>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {presentStudentsCount} students
                    </span>
                    {students.length > 0 && (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="text-sm text-red-600 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1 p-2 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 " />
                        Delete All
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {students.length > 0 ? (
                    <ul className="space-y-2 pr-2">
                      {students.map((student) => (
                        <li
                          key={student.id}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors group ${
                            editingStudentId === student.id
                              ? "ring-2 ring-gray-500/50 ring-inset"
                              : "hover:bg-gray-700/50"
                          }`}
                        >
                          {editingStudentId === student.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, student.id)}
                                onBlur={() => handleSaveEdit(student.id)}
                                className="flex-1 bg-transparent text-white px-2 py-1 focus:outline-none"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="checkbox"
                                  checked={student.isPresent}
                                  onChange={() => togglePresence(student.id)}
                                  className={`w-4 h-4 rounded border focus:ring-blue-500 ${
                                    isDarkMode
                                      ? "border-gray-600 text-blue-500 bg-gray-700"
                                      : "border-gray-300 text-blue-600 bg-white"
                                  } cursor-pointer flex-shrink-0`}
                                />
                                <span
                                  className={`text-sm w-5 flex-shrink-0 ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {students.indexOf(student) + 1}.
                                </span>
                                <span
                                  className={`${
                                    student.isPresent
                                      ? ""
                                      : isDarkMode
                                      ? "line-through text-gray-500"
                                      : "line-through text-gray-400"
                                  } truncate`}
                                >
                                  {student.name}
                                </span>
                              </div>
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditName(student)}
                                  className="text-gray-400 hover:text-blue-500 transition-colors hover:cursor-pointer p-2.5 hover:bg-blue-500/10 rounded-lg"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteStudent(student.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors hover:cursor-pointer p-2.5 hover:bg-red-500/10 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                      <span className="text-4xl mb-4">👥</span>
                      <p className="text-m">No students added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Team Results */}
            <div
              className={`lg:col-span-2 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-2xl shadow-lg p-4 md:p-6`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold">
                    Team Results
                  </h2>
                  {showSuccessEmoji && <span className="text-2xl">🎉</span>}
                </div>
                <div className="flex items-center gap-4">
                  {teams.length > 0 && (
                    <button
                      onClick={handleExport}
                      className="hover:cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  )}
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {teamCount} teams
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex items-center justify-center">
                  {isShuffling ? (
                    <div className="min-h-[400px] w-full flex flex-col items-center justify-center">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                      <p
                        className={`text-xl ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Shuffling... 🤔
                      </p>
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="min-h-[400px] w-full flex flex-col items-center justify-center text-center text-gray-500">
                      <span className="text-7xl mb-6">🎯</span>
                      <p className="text-xl mb-2 font-bold">Generate Teams</p>
                      <p className="text-sm">
                        Add students on the left and click &quot;Start
                        Shuffling&quot; to generate teams
                      </p>
                    </div>
                  ) : (
                    <div className="h-full w-full overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team, index) => (
                          <div
                            key={index}
                            className={`p-4 border rounded-xl ${
                              isDarkMode
                                ? "border-gray-700 bg-gray-850"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full ${TEAM_COLORS[index].bg}`}
                              ></div>
                              Team {String.fromCharCode(65 + index)}
                            </h3>
                            <ul className="space-y-1">
                              {team.map((student, studentIndex) => (
                                <li
                                  key={student.id}
                                  className={`p-2 rounded-lg flex items-center gap-2 ${
                                    studentIndex !== team.length - 1
                                      ? isDarkMode
                                        ? "border-b border-gray-700"
                                        : "border-b border-gray-200"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`flex items-center justify-center w-5 h-5 rounded-full ${TEAM_COLORS[index].bg} text-white text-xs font-medium`}
                                  >
                                    {studentIndex + 1}
                                  </span>
                                  {student.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-6 max-w-md w-full shadow-xl`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-semibold">Confirm Deletion</h3>
                </div>
                <p
                  className={`mb-6 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Are you sure you want to delete all students? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`px-4 py-2 ${
                      isDarkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    } transition-colors cursor-pointer`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAllStudents}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer
        className={`${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        } py-4 text-center text-sm ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Created by{" "}
        <a
          href="https://bento.me/fuuum"
          target="_blank"
          rel="noopener noreferrer"
          className={`hover:text-blue-400 transition-colors ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Fumitaka Fujisaki
        </a>
      </footer>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? "#1F2937" : "#F3F4F6"};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "#4B5563" : "#D1D5DB"};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "#6B7280" : "#9CA3AF"};
        }
      `}</style>
    </>
  );
}
