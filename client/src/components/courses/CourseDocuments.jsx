import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { ChatIA } from "../ia/ChatIA.jsx";
import { useCourseById } from "../../shared/hooks/useCourseById.jsx";
import { useDocumentsByBimester } from "../../shared/hooks/useDocumentsByBimester.jsx";
import { useUserDetails } from "../../shared/hooks/useUserDetails.jsx";
import { useDeleteDocument } from "../../shared/hooks/useDeleteDocument.jsx";
import { useGetTrivia } from "../../shared/hooks/useGetTrivia.jsx";
import { useCheckAnswer } from "../../shared/hooks/useCheckAnswer.jsx";

import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { Spinner } from "../Spinner.jsx";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isDesktop;
};

export const CourseDocuments = () => {
  const { cid } = useParams();
  const navigate = useNavigate();
  const { trivia, fetchTrivia } = useGetTrivia(); //
  const { answer, response, isLoadingAnswer } = useCheckAnswer();
  const { course, isLoading: loadingCourse, error: courseError } = useCourseById(cid);
  const {
    documents,
    setDocuments,
    fetchDocuments,
    loading: loadingDocs,
    error: errorDocs
  } = useDocumentsByBimester(cid); //
  const { user } = useUserDetails();
  const { deleteDoc, error: deleteError } = useDeleteDocument(cid);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedBimester, setSelectedBimester] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showChatIA, setShowChatIA] = useState(false);
  const [opciones, setOpciones] = useState([]);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [form, setForm] = useState({ answer: null, triviaId: null, answerIndex: null });
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  
  const [isTimerVisible, setIsTimerVisible] = useState(false);

  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isDesktop = useIsDesktop();
  const [showChatWindow, setShowChatWindow] = useState(false); 

  useEffect(() => {
    document.body.style.overflow = selectedDocument ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedDocument]);

  useEffect(() => {
    if (!shouldFetch) return;

    fetchTrivia(cid); //
    setShouldFetch(false);

  }, [shouldFetch, fetchTrivia, cid]);

  useEffect(() => {
    if (!trivia?.opciones) return; //

    setOpciones([
      { opcion: "A", respuesta: trivia.opciones.A }, //
      { opcion: "B", respuesta: trivia.opciones.B }, //
      { opcion: "C", respuesta: trivia.opciones.C }, //
      { opcion: "D", respuesta: trivia.opciones.D }, //
    ]);
    setTimeLeft(60);
    setTimeUp(false);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [trivia]); //

  useEffect(() => {
    if (form.answer !== null) {
      setSelectedAnswer(form.answerIndex); 
      setShowResult(true);
      answer(form.triviaId, form);
      setForm({ answer: null, triviaId: null, answerIndex: null });
    }
  }, [form, answer]);

  useEffect(() => {
    if (response?.esCorrecta) {
      setTimeLeft(0);
      setTimeUp(true); 
    }
  }, [response]);

  useEffect(() => {
    let interval;

    if (isModalOpen && !showResult && !timeUp && timeLeft > 0 && isTimerVisible) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimeUp(true);
            setShowResult(true);
            setIsTimerVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isModalOpen, showResult, timeUp, timeLeft, isTimerVisible]);


  useEffect(() => {
    fetchDocuments({ bimester: String(selectedBimester) }); //
    setQuery("");
    setSearchQuery("");
  }, [cid, selectedBimester, fetchDocuments]); //

  const onDelete = async (did) => {
    const res = await deleteDoc(did);
    if (res.data?.success) {
      setDocuments(prev => prev.filter(d => d._id !== did)); //
    } else {
      alert(deleteError || "Error al eliminar");
    }
  };
  
  const filteredDocs = documents.filter(doc => //
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loadingCourse) return <Spinner />;
  if (courseError) return <p className="p-4 text-red-500">{courseError}</p>;
  if (!course) return <p className="p-4">Curso no encontrado.</p>;

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setSearchQuery(query);
    }
  };
  
  const clearSearch = () => {
      setQuery("");
      setSearchQuery("");
  };

  const getMaxBimesters = () => {
    const name = course.degree?.name;
    if (name === "Sexto") return 3;
    if (["Cuarto", "Quinto"].includes(name)) return 4;
    return 5;
  };

  const isWordDocument = (filename) => /\.(doc|docx)$/i.test(filename);
  const isImage = (filename) => /\.(jpe?g|png|gif|webp)$/i.test(filename);
  const getViewerUrl = (url, name) =>
    isWordDocument(name)
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
      : url;

  const selectedDocObj = documents.find(d => d.filePath === selectedDocument); //

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };
  const modalVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };
  const panelVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };
  const cardVariants = {
    initial: { opacity: 0, scale: 0.99 },
    animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    whileHover: { scale: 1.03, boxShadow: '0px 10px 20px rgba(0,0,0,0.15)', transition: { type: 'spring', stiffness: 200, damping: 20 } },
  };
  const buttonVariants = { whileTap: { scale: 0.95 }, whileHover: { scale: 1.02 }, transition: { type: 'spring', stiffness: 400, damping: 10 } };

  const openModal = async () => {
    setShouldFetch(true);
    setIsModalOpen(true);
    setIsTimerVisible(true);
  };

  const generateNewTrivia = async () => {
    setOpciones([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setShouldFetch(true);
    setIsTimerVisible(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetTrivia();
    setIsTimerVisible(false);
  };

  const selectAnswer = (answer, triviaId, answerIndex) => {
    if (showResult) return;

    setForm(prev => ({ ...prev, answer: answer, triviaId: triviaId, answerIndex: answerIndex }));
  };

  const resetTrivia = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(60);
    setTimeUp(false);
    setIsTimerVisible(true);
  };

  const getButtonClass = (answerIndex) => {
    let baseClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-300 font-medium ";
    
    if (!showResult) {
      return baseClass + "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:transform hover:scale-105 cursor-pointer";
    }
    
    if (selectedAnswer === answerIndex) {
      if (response?.esCorrecta) {
        return baseClass + "bg-green-500 text-white border-green-500 shadow-lg";
      } else {
        return baseClass + "bg-red-500 text-white border-red-500 shadow-lg";
      }
    }
    
    if (response?.respuestaCorrecta === opciones[answerIndex]?.opcion) { //
      return baseClass + "bg-green-100 text-green-700 border-green-300 cursor-not-allowed opacity-90";
    }

    return baseClass + "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70";
  };

  const isCorrect = response?.esCorrecta;
  const isLoadingTrivia = opciones.length === 0; //
  
  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-600 bg-green-100 border-green-300';
    if (timeLeft > 10) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  return (
    <AnimatePresence>
      <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit" className="pt-1 px-8 pb-8 min-h-screen">
        <div className="flex items-center mb-4 space-x-2">
          <button
            onClick={() => {
              if (user.role === 'STUDENT_ROLE') {
                navigate('/kinal.library/cursos/estudiante');
              } else if (user.role === 'TEACHER_ROLE') {
                navigate('/kinal.library/cursos/maestro');
              } else {
                navigate('/kinal.library/cursos');
              }
            }}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold">{course.name}</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {Array.from({ length: getMaxBimesters() }, (_, i) => (
            <motion.button key={i} onClick={() => setSelectedBimester(i + 1)}
              className={`px-10 py-3 sm:px-5 sm:py-2 font-medium rounded-lg text-white text-lg sm:text-base transition ${selectedBimester === i + 1 ? 'bg-[#b8001c] hover:bg-[#a70019]' : 'bg-gray-400 hover:bg-gray-500'}`}
              variants={buttonVariants} whileTap="whileTap" whileHover="whileHover"
            >
              Bimestre {i + 1}
            </motion.button>
          ))}
        </div>

        <button
          onClick={openModal}
          className="fixed bottom-4 right-4 bg-[#1e3169] hover:bg-[#16254c] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Iniciar trivia">
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>

        {/* Temporizador FIJO en la esquina inferior izquierda (para desktop) */}
        <AnimatePresence>
          {isTimerVisible && isModalOpen && !showResult && isDesktop && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className={`fixed bottom-4 left-4 p-4 rounded-xl border-2 shadow-lg flex items-center ${getTimerColor()} z-[60]`}
            >
              <ClockIcon className="w-6 h-6 mr-2" />
              <span className="text-2xl font-bold">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                {String(timeLeft % 60).padStart(2, '0')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"> 
              
              <div className="bg-gradient-to-r from-[#1e3169] to-[#16254c] text-white p-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-medium">Cuestionario Inteligente</h2>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full transition-all duration-300 hover:rotate-90"
                  >
                    <XMarkIcon className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>

              {/* Temporizador para MÓVILES: Arriba del modal y centrado */}
              <AnimatePresence>
                {isTimerVisible && !showResult && !isDesktop && ( // Solo para móvil, visible si el modal está abierto y no hay resultado
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`mx-8 mt-6 p-4 rounded-xl border-2 shadow-lg flex items-center justify-center ${getTimerColor()}`} // mx-8 para margen, justify-center para centrar
                  >
                    <ClockIcon className="w-6 h-6 mr-2" />
                    <span className="text-2xl font-bold">
                      {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                      {String(timeLeft % 60).padStart(2, '0')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="max-h-[calc(90vh-100px)] overflow-y-auto"> 
                <div className="p-8">
                  {isLoadingTrivia ? (
                    <div className="bg-white rounded-xl p-6 border-l-4 border-gray-200 shadow-lg mb-6">
                      <div className="mb-6">
                          <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-4/5"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/5"></div>
                      </div>
                      <div className="space-y-3">
                          <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse mr-2"></div><div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div></div></div>
                          <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse mr-2"></div><div className="h-4 bg-gray-200 rounded animate-pulse flex-1 w-4/5"></div></div></div>
                          <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse mr-2"></div><div className="h-4 bg-gray-200 rounded animate-pulse flex-1 w-3/4"></div></div></div>
                          <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse mr-2"></div><div className="h-4 bg-gray-200 rounded animate-pulse flex-1 w-5/6"></div></div></div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 border-l-4 border-gray-200 shadow-lg mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
                        {trivia.texto}
                      </h3>
                      <div className="space-y-3">
                        {opciones.map((answer, answerIndex) => (
                          <button
                            key={answer.opcion}
                            onClick={() => selectAnswer(answer.opcion, trivia.triviaId, answerIndex)} //
                            disabled={showResult}
                            className={getButtonClass(answerIndex)}
                          >
                            <span className="font-medium text-gray-700 mr-2">
                              {String.fromCharCode(65 + answerIndex)}.
                            </span>
                            {answer.respuesta}
                          </button>
                        ))}
                      </div>
                    </div>)}

                  {showResult && (
                    <div className={`text-center p-6 rounded-xl mb-6 ${
                      isCorrect 
                        ? 'bg-green-100 border-2 border-green-300' 
                        : 'bg-red-100 border-2 border-red-300'
                    }`}>
                      <h3 className={`text-2xl font-bold mb-2 ${
                        isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {isCorrect ? '¡Correcto!' : '¡Incorrecto!'}
                      </h3>
                      <p className={`text-lg ${
                        isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isCorrect 
                          ? `Excelente conocimiento sobre la materia de ${course.name}`
                          : 'Lo sentimos, intenta de nuevo'
                        }
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={resetTrivia}
                      disabled={timeUp}
                      className={`flex-1 font-medium text-xl py-3 px-6 rounded-xl transition-all duration-300 ${
                        timeUp
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none opacity-50' 
                          : 'bg-[#1e3169] hover:bg-[#16254c] text-white transform hover:-translate-y-1 hover:shadow-lg'
                      }`}
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={generateNewTrivia}
                      className="flex-1 bg-[#b8001c] hover:bg-[#a70019] text-white font-medium text-xl py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      Nuevo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-100 p-6 rounded-2xl shadow mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full sm:w-auto sm:flex-1 md:max-w-md bg-white rounded-lg">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Buscar en documentos del bimestre ${selectedBimester}`}
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#b8001c] transition"
                    />
                    {query && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Limpiar búsqueda"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    )}
                </div>
            </div>

            {user.role !== "STUDENT_ROLE" && (
              <motion.button
                onClick={() => navigate(`/kinal.library/cursos/${cid}/subir-documento`)}
                className="px-4 py-2 font-medium bg-[#1e3169] text-white rounded-lg hover:bg-[#16254c] transition w-full sm:w-auto"
                variants={buttonVariants} whileTap="whileTap" whileHover="whileHover"
              >
                Subir documento
              </motion.button>
            )}
          </div>

          {loadingDocs ? (
            <div className="text-center text-gray-500">Cargando documentos...</div>
          ) : errorDocs ? (
            <p className="text-red-500">{errorDocs}</p>
          ) : (
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
              <AnimatePresence initial={false}>
                {filteredDocs.map(doc => (
                  <motion.div key={doc._id} variants={cardVariants} initial="initial" animate="animate" exit="exit" whileHover="whileHover" layout
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col justify-between w-70 sm:w-64"
                  >
                    <div className="h-32 flex items-center justify-center mb-4">
                      {isImage(doc.fileName) ? (
                        <img src={doc.filePath} alt={doc.fileName} className="h-full object-contain"/>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <DocumentIcon className={`w-16 h-16 ${isWordDocument(doc.fileName) ? 'text-blue-600' : 'text-red-500'}`} />
                          <span className="mt-2 uppercase">{doc.fileName.split('.').pop()}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-sm font-medium text-gray-800 mb-4 truncate" title={doc.fileName}>{doc.fileName}</p>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        {!isImage(doc.fileName) && (
                          <button onClick={() => setSelectedDocument(doc.filePath)}
                            className="flex-1 px-4 py-2 bg-[#1e3169] text-white font-medium hover:bg-[#16254c] rounded-lg transition"
                          >Ver</button>
                        )}
                      </div>
                      {user.role !== 'STUDENT_ROLE' && (
                        <button onClick={() => onDelete(doc._id)}
                          className="px-4 py-2 bg-[#b8001c] hover:bg-[#a70019] font-medium text-white rounded-lg transition disabled:opacity-50"
                        >Eliminar</button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredDocs.length === 0 && !loadingDocs && !errorDocs && (
                <div className="w-full text-center py-10">
                  <p className="text-gray-500">{searchQuery ? `No se encontraron documentos para "${searchQuery}"` : "No hay documentos para este bimestre"}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {isDesktop && (
          <>
            <AnimatePresence>
            {selectedDocument && (
              <motion.div variants={modalVariants} initial="initial" animate="animate" exit="exit"
                className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <div className="relative flex flex-col lg:flex-row w-full max-w-7xl h-[90vh]">
                  <motion.div variants={panelVariants} initial="initial" animate="animate" exit="exit"
                    className={`bg-white rounded-2xl shadow flex flex-col transition-all ${showChatIA ? 'lg:w-2/3' : 'w-full'}`}
                  >
                    <div className="flex justify-between font-medium items-center px-6 py-3 bg-[#800020] text-white rounded-t-2xl">
                      <span>{selectedDocObj?.fileName}</span>
                      <button onClick={() => { setSelectedDocument(null); setShowChatIA(false); }}>✖</button>
                    </div>
                    <iframe
                      src={getViewerUrl(selectedDocument, selectedDocObj?.fileName)}
                      title="Visor"
                      frameBorder="0"
                      className="w-full h-full"
                    />
                  </motion.div>

                  {!isWordDocument(selectedDocObj?.fileName) && (
                    showChatIA ? (
                      <motion.div variants={panelVariants} initial="initial" animate="animate" exit="exit"
                        className="bg-white rounded-2xl shadow flex flex-col w-full lg:w-1/3 ml-0 lg:ml-4 mt-4 lg:mt-0 h-full min-h-0"
                      >
                        <div className="flex font-medium justify-between items-center px-6 py-3 bg-[#800020] text-white rounded-t-2xl">
                          <span>Chat Inteligente</span>
                          <button onClick={() => setShowChatIA(false)}>✖</button>
                        </div>
                        <div className="flex-1 min-h-0">
                          <ChatIA pdfUrl={selectedDocument} user={user} />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.button variants={panelVariants} initial="initial" animate="animate" exit="exit"
                        className="absolute bottom-4 right-4 lg:right-8 bg-[#800020] hover:bg-[#a70024] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2"
                        onClick={() => setShowChatIA(true)}
                      >
                        <ChatBubbleLeftRightIcon className="w-6 h-6" />
                      </motion.button>
                    )
                  )}
                  
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </>
        )}

        {/* ───── VERSIÓN MÓVIL (< lg) ───── */}
        {!isDesktop && selectedDocument && (
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col p-4 sm:p-6 md:p-8 items-center justify-center"
          >
            <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl shadow-xl overflow-hidden">
              {/* Barra roja */}
              <div className="flex justify-between items-center px-4 py-3 bg-[#800020] text-white">
                <span className="font-medium truncate">{selectedDocObj?.fileName}</span>
                <button onClick={() => setSelectedDocument(null)} className="p-1 rounded-full hover:bg-white/20 transition">
                  <XMarkIcon className="w-6 h-6"/>
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                  {!showChatIA ? (
                    <motion.div
                      key="document-content"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full"
                    >
                      <iframe
                        src={getViewerUrl(selectedDocument, selectedDocObj?.fileName)}
                        title="Visor de Documento"
                        frameBorder="0"
                        className="w-full h-full min-h-[calc(90vh-140px)]"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="chat-content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full"
                    >
                      <ChatIA pdfUrl={selectedDocument} user={user}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pestañas fijas abajo */}
              <div className="flex bg-white mt-4">
                <button
                  onClick={() => setShowChatIA(false)}
                  className={`flex-1 py-3 text-center font-semibold transition ${
                    !showChatIA ? 'bg-[#800020] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Documento
                </button>
                <button
                  onClick={() => setShowChatIA(true)}
                  className={`flex-1 py-3 text-center font-semibold transition ${
                    showChatIA ? 'bg-[#800020] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Chat Inteligente
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};