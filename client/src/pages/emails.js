import { useUser } from '@/components/UserContext';
import Head from 'next/head';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AllMailsTab from '@/components/pages/emails/AllMailsTab';
import CreateMailTab from '@/components/pages/emails/CreateMailTab';
import { fetchEmails } from '@/components/pages/emails/fetchEmails';
import SelectedEmailForm from '@/components/pages/emails/SelectedEmailForm';
import { Spinner, Input, Button, Modal, ModalHeader, ModalFooter, ModalBody, ModalContent } from "@nextui-org/react";

export default function EmailsPage() {
  const user = useUser();
  const isAdmin = user.admin === true;
  const isTwofaEnabled = user.twofaEnable === true;
  const [selectedTab, setSelectedTab] = useState('allMails');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]); // Состояние для фильтрованных email
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поискового запроса
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [mathProblem, setMathProblem] = useState(''); // для хранения примера
  const [mathAnswer, setMathAnswer] = useState(null); // для хранения ответа на пример
  const [emailToDelete, setEmailToDelete] = useState(null);

  useEffect(() => {
    fetchEmails(setEmails, setIsLoading);
  }, []);

  useEffect(() => {
    // Фильтрация почт по email и username в зависимости от поискового запроса
    const filtered = emails.filter(
      (email) =>
        email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmails(filtered);
  }, [emails, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value); // Обновляем значение searchTerm
  };
  

  const handleSelectEmailTab = (email) => {
    setSelectedTab('selected-email');
    setSelectedEmail(email);
  };

  const setSelectedEmailTab = (email) => {
    setSelectedEmail(email);
    setSelectedTab('selected-email');
  };

  if (!user) {
    return <div className="flex items-center justify-center p-24"><Spinner size="lg" /></div>;
  }

  const handleSelectAll = () => {
    if (isAllChecked) {
      setSelectedEmails([]);
      setIsAllChecked(false);
      setIsIndeterminate(false);
    } else {
      const allEmailIds = emails.map((email) => email._id);
      setSelectedEmails(allEmailIds);
      setIsAllChecked(true);
      setIsIndeterminate(false);
    }
  };

  const handleSelectEmail = (emailId) => {
    const alreadySelected = selectedEmails.includes(emailId);

    if (alreadySelected) {
      const newSelected = selectedEmails.filter((id) => id !== emailId);
      setSelectedEmails(newSelected);
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }

    setIsAllChecked(emails.length === selectedEmails.length + 1);
    setIsIndeterminate(selectedEmails.length > 0 && selectedEmails.length < emails.length);
  };

  useEffect(() => {
    if (selectedEmails.length === 0) {
      setIsAllChecked(false);
      setIsIndeterminate(false);
    } else if (selectedEmails.length === emails.length) {
      setIsAllChecked(true);
      setIsIndeterminate(false);
    } else {
      setIsIndeterminate(true);
    }
  }, [selectedEmails, emails]);

  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 50) + 1; // случайное число от 1 до 50
    const num2 = Math.floor(Math.random() * 50) + 1; // случайное число от 1 до 50
    const isAddition = Math.random() > 0.5; // случайно выбираем сложение или вычитание

    const problem = isAddition ? `${num1} + ${num2}` : `${num1} - ${num2}`;
    const answer = isAddition ? num1 + num2 : num1 - num2;

    setMathProblem(problem);
    setMathAnswer(answer);
  };

  const handleOpenDeleteModal = (selectedEmails) => {
    setDeleteModalOpen(true);
    setEmailToDelete(selectedEmails);
    setConfirmText('');
    generateMathProblem(); // Генерируем пример при открытии модального окна
  };

    // Обработчик удаления почт
    const handleDeleteEmails = async () => {
      setIsLoading(true);
      try {
        // Можете добавить свой код API для удаления
        await axios.post('http://localhost:5000/api/delete-emails', { ids: selectedEmails });
  
        // Очищаем выбранные почты и закрываем модальное окно
        setSelectedEmails([]);
        setIsAllChecked(false);
        setIsIndeterminate(false);
        setDeleteModalOpen(false);
        fetchEmails(setEmails, setIsLoading);
      } catch (error) {
        console.error('Ошибка при удалении почт', error);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <>
      <Head>
        <title>Управления ящиками - WebConnect</title>
        <meta name="description" content="Добро пожаловать на главную страницу WebConnect" />
      </Head>
      <div className="w-full h-full">
        <div className="max-w-1320 py-6 flex flex-col mx-auto">
          <div className="text-4xl text-[#343F52] font-semibold">
            Управления ящиками
          </div>
          <div className="flex flex-col mt-6">
            <div id="navigation-mail" className="border border-[#E9EBF3] rounded-t-lg flex">
              <button
                onClick={() => (setSelectedTab('allMails'), setSelectedEmail(null))}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'allMails' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex gap-3 ${selectedTab === 'allMails' ? 'text-[#243F8F]' : ''}`}>
                  Все почты <span className="flex items-center justify-center rounded-md bg-[#243F8F] font-semibold w-5 h-5 text-white">{emails.length}</span>
                </span>
              </button>

              <button
                onClick={() => (setSelectedTab('createMail'), setSelectedEmail(null))}
                className={`emails-nav flex items-center justify-center px-8 py-3 ${selectedTab === 'createMail' ? 'active' : ''}`}
              >
                <span className={`text-sm text-light flex items-center gap-2 font-regular ${selectedTab === 'createMail' ? 'text-[#243F8F]' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 15C4.14 15 1 11.86 1 8C1 4.14 4.14 1 8 1C11.86 1 15 4.14 15 8C15 11.86 11.86 15 8 15ZM8 2C4.69 2 2 4.69 2 8C2 11.31 4.69 14 8 14C11.31 14 14 11.31 14 8C14 4.69 11.31 2 8 2Z" />
                    <path d="M8 11.5C7.72 11.5 7.5 11.28 7.5 11V5C7.5 4.72 7.72 4.5 8 4.5C8.28 4.5 8.5 4.72 8.5 5V11C8.5 11.28 8.28 11.5 8 11.5Z" />
                    <path d="M11 8.5H5C4.72 8.5 4.5 8.28 4.5 8C4.5 7.72 4.72 7.5 5 7.5H11C11.28 7.5 11.5 7.72 11.5 8C11.5 8.28 11.28 8.5 11 8.5Z" />
                  </svg>
                  Создать почту
                </span>
              </button>

              {selectedEmail && (
                <button
                  onClick={() => setSelectedTab('selected-email')}
                  className={`emails-nav flex items-center justify-center px-8 py-3 ${
                    selectedTab === 'selected-email' ? 'active' : ''
                  }`}
                >
                  <span className={`text-sm text-light flex items-center gap-2 font-regular ${selectedTab === 'selected-email' ? 'text-[#243F8F]' : ''}`}>
                    {selectedEmail.email}
                  </span>
                </button>
              )}
            </div>

            <motion.div
              id="template-mail"
              className="p-8 border border-[#E9EBF3] border-t-0 rounded-b-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedTab === 'allMails' && (
                <div className="w-full flex items-center justify-start mb-4 gap-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Поиск"
                      labelPlacement="outside"
                      value={searchTerm} // Привязка к состоянию
                      onChange={handleSearch} // Обработчик изменения
                      endContent={<img src="/assets/img/octicon_search-16.svg" alt="" />}
                    />
                  </div>
                  
                  {selectedEmails.length > 0 && isAdmin && (
                    <motion.div
                    initial={{ x: -10, opacity: 0}}
                    animate={{opacity: 1, x: 0}}
                    exit={{x: -10, opacity: 1}}
                    transition={{duration: 0.3}}>
                    <Button color="default" variant="flat" onClick={() => handleOpenDeleteModal(selectedEmails)}>
                      Удалить
                    </Button>
                    </motion.div>
                  )}
                </div>
              )}
              {isLoading ? (
                <div className="flex items-center justify-center p-24">
                  <Spinner size="lg" />
                </div>
              ) : (
                selectedTab === 'allMails' ? (
                  <AllMailsTab
                    emails={filteredEmails} // Передаем фильтрованные email
                    isAdmin={isAdmin}
                    isTwofaEnabled={isTwofaEnabled}
                    searchTerm={searchTerm}
                    handleSelectEmailTab={handleSelectEmailTab}
                    setSelectedEmailTab={setSelectedEmailTab}
                    fetchEmails={() => fetchEmails(setEmails, setIsLoading)}
                    selectedEmails={selectedEmails}
                    isAllChecked={isAllChecked}
                    isIndeterminate={isIndeterminate}
                    handleSelectAll={handleSelectAll}
                    handleSelectEmail={handleSelectEmail}
                  />
                ) : selectedTab === 'createMail' ? (
                  <CreateMailTab fetchEmails={() => fetchEmails(setEmails, setIsLoading)} />
                ) : selectedTab === 'selected-email' && selectedEmail ? (
                  <SelectedEmailForm selectedEmail={selectedEmail} />
                ) : null
              )}
            </motion.div>

            <Modal size="lg" isOpen={deleteModalOpen} onClose={() => {
              setDeleteModalOpen(false);
              setConfirmText('');
            }} closeButton backdrop="blur"
            motionProps={{
                variants: {
                enter: {
                    y: 0,
                    opacity: 1,
                    transition: {
                    duration: 0.3,
                    ease: "easeOut",
                    },
                },
                exit: {
                    y: -20,
                    opacity: 0,
                    transition: {
                    duration: 0.2,
                    ease: "easeIn",
                    },
                },
                },
            }} 
            >
            <ModalContent>
                <ModalHeader>
                <div>Удаление</div>
                </ModalHeader>
                <ModalBody>
                <div>Для удаления почты введите "<strong>{mathProblem}</strong>" ниже и нажмите подтвердить.</div>
                <Input
                    clearable
                    fullWidth
                    bordered
                    size="lg"
                    placeholder={`Введите  для подтверждения`}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                />
                </ModalBody>
                <ModalFooter>
                <Button flat color="error" onClick={() => {
                    setDeleteModalOpen(false);
                    setConfirmText(''); // Сбрасываем поле
                }}>
                    Закрыть
                </Button>
                <Button
                  auto
                  className="bg-[#FF5A67] text-white disabled:opacity-50 disabled:pointer-events-none"
                  isLoading={isLoading}
                  onClick={handleDeleteEmails}
                  isDisabled={isLoading || Number(confirmText) !== mathAnswer} // Проверка, правильный ли ответ
                >
                    Подтвердить
                </Button>
                </ModalFooter>
            </ModalContent>
            </Modal>
          </div>
        </div>
      </div>

        
    </>
  );
}
