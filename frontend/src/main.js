import './style.css'

// ALSHAM 360° PRIMA - JavaScript Principal
console.log('🚀 ALSHAM 360° PRIMA iniciado com sucesso!')

// Funcionalidades básicas do webapp
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar interatividade aos botões
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Botão clicado:', this.textContent);
      
      // Feedback visual
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  });

  // Adicionar interatividade aos links da tabela
  const tableActions = document.querySelectorAll('.table-action');
  tableActions.forEach(action => {
    action.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Ação da tabela clicada:', this.textContent);
      alert('Funcionalidade em desenvolvimento - ' + this.textContent);
    });
  });

  // Adicionar hover effects nos cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    });
  });

  console.log('✅ Interatividade do ALSHAM 360° PRIMA configurada!');
});

