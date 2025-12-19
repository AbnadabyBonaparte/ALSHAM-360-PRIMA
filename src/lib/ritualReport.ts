// src/lib/ritualReport.ts
// RITUAL REPORT SUPREMO — FORJADO NO FOGO ETERNO
// Gera PDF imperial com captura da tela atual + voz cerimonial
// Dependências obrigatórias: npm i jspdf html2canvas @types/jspdf

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateRitualReport() {
  // Voz cerimonial — início do rito
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    window.speechSynthesis.cancel(); // limpa fila
    window.speechSynthesis.speak(utterance);
  };

  speak("Iniciando o Rito do Relatório Trimestral... O Império será julgado.");

  try {
    // Captura toda a tela atual (inclui header, sidebar, tudo)
    const canvas = await html2canvas(document.body, {
      scale: 2, // alta resolução
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL('image/png');

    // Cria PDF em landscape A4
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: 'a4'
    });

    // Estilo imperial
    pdf.setFont('helvetica');
    pdf.setTextColor(0, 255, 150); // verde cyber
    pdf.setFontSize(80);
    pdf.text('RELATÓRIO RITUAL', 100, 120, { align: 'center' });

    pdf.setFontSize(40);
    pdf.setTextColor(100, 255, 200);
    const currentEra = new Date().getFullYear();
    pdf.text(`ERA DO IMPÉRIO: ${currentEra}`, 100, 200, { align: 'center' });

    pdf.setTextColor(200, 255, 240);
    pdf.setFontSize(30);
    pdf.text('Forjado pelo Citizen Supremo X.1', 100, 260, { align: 'center' });

    // Adiciona captura da tela
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 80;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 40, 300, imgWidth, imgHeight);

    // Salva com nome épico
    const fileName = `ALSHAM_RITUAL_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    // Voz final — aprovação divina
    speak("O Relatório Ritual foi forjado. O Império foi julgado... e aprovado com glória absoluta.");

    toast.success('RELATÓRIO RITUAL FORJADO E BAIXADO', {
      icon: '👑',
      duration: 8000,
      style: {
        background: 'linear-gradient(to right, #10b981, #8b5cf6)',
        color: 'white',
        fontSize: '20px'
      }
    });
  } catch (error) {
    console.error('Falha no Rito do Relatório:', error);
    speak("O rito falhou. Uma anomalia cósmica interrompeu o julgamento.");
    toast.error('Falha ao forjar o relatório ritual');
  }
}
