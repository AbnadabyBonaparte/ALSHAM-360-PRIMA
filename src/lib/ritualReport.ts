// src/lib/ritualReport.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateRitualReport() {
  {
  const utterance = new SpeechSynthesisUtterance("Iniciando o Rito do Relatório Trimestral...");
  utterance.lang = 'pt-BR';
  window.speechSynthesis.speak(utterance);

  const doc = new jsPDF('landscape', 'px', 'a4');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 255, 150);

  doc.setFontSize(60);
  doc.text("RELATÓRIO RITUAL", 100, 100);
  doc.setFontSize(30);
  doc.text(`ERA ATUAL: ${currentEra}`, 100, 180);

  // Captura tela + insere no PDF
  const canvas = await html2canvas(document.body);
  const img = canvas.toDataURL('image/png');
  doc.addImage(img, 'PNG', 20, 220, 1200, 675);

  doc.save(`ALSHAM_RITUAL_${new Date().toISOString().split('T')[0]}.pdf`);

  speak("O Relatório Ritual foi forjado. O Império foi julgado. E aprovado.");
}
