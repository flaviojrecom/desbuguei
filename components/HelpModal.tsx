import React from 'react';
import { useKeyboardShortcut, KEYBOARD_SHORTCUTS } from '../src/hooks/useKeyboardShortcut';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Help Modal Component
 * Displays all available keyboard shortcuts and navigation tips to users
 * Accessible via ? key or Help button
 */
export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Implement focus trap for modal
  useFocusTrap(isOpen, modalRef, onClose);

  // Close modal with Escape key
  useKeyboardShortcut(
    KEYBOARD_SHORTCUTS.ESCAPE.key,
    onClose,
    {}
  );

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Atalhos de teclado e ajuda"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <aside className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-night-panel/95 backdrop-blur-xl border-2 border-primary rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-night-panel/95 border-b border-night-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              help_outline
            </span>
            <h2 className="text-2xl font-bold font-display text-slate-100">
              Atalhos de Teclado
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar ajuda"
            className="text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded-full p-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Global Shortcuts */}
          <section>
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                language
              </span>
              Atalhos Globais
            </h3>
            <div className="space-y-3">
              <ShortcutItem
                keys={['Alt', 'V']}
                action="Abrir Assistente de Voz"
                description="Ativar o assistente de voz em qualquer página"
              />
              <ShortcutItem
                keys={['Escape']}
                action="Fechar Modal"
                description="Fecha o assistente de voz ou qualquer modal aberto"
              />
              <ShortcutItem
                keys={['Tab']}
                action="Navegação Avançada"
                description="Mover para o próximo elemento focável"
              />
              <ShortcutItem
                keys={['Shift', 'Tab']}
                action="Navegação Reversa"
                description="Mover para o elemento focável anterior"
              />
            </div>
          </section>

          {/* Settings Page Shortcuts */}
          <section>
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                settings
              </span>
              Configurações
            </h3>
            <div className="space-y-3">
              <ShortcutItem
                keys={['←', '→']}
                action="Navegar Personagens"
                description="Selecionar diferentes mentores de IA"
              />
              <ShortcutItem
                keys={['↑', '↓']}
                action="Navegação em Grade"
                description="Navegação alternativa entre personagens"
              />
              <ShortcutItem
                keys={['Space', 'Enter']}
                action="Selecionar"
                description="Selecionar personagem ou alternar tema"
              />
            </div>
          </section>

          {/* Form Shortcuts */}
          <section>
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                edit
              </span>
              Formulários
            </h3>
            <div className="space-y-3">
              <ShortcutItem
                keys={['Enter']}
                action="Enviar Formulário"
                description="Submeter formulário de acesso ou alimentação de IA"
              />
              <ShortcutItem
                keys={['Tab']}
                action="Próximo Campo"
                description="Mover para o próximo campo do formulário"
              />
            </div>
          </section>

          {/* Accessibility Info */}
          <section className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">accessibility</span>
              Acessibilidade
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Esta aplicação segue as diretrizes <strong>WCAG 2.1 Level AA</strong> para
              acessibilidade. Todos os elementos são navegáveis via teclado,
              com indicadores de foco visíveis e suporte completo a leitores de tela.
            </p>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                lightbulb
              </span>
              Dicas
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>
                  Procure pelo ícone <strong>de teclado (⌨️)</strong> para
                  dicas de atalhos em diferentes seções
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>
                  Você pode navegar por este diálogo completamente com o teclado
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>
                  Todos os atalhos funcionam mesmo com o mouse desabilitado
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>
                  Para acessibilidade plena, use um leitor de tela como
                  NVDA, JAWS ou VoiceOver
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-night-panel/95 border-t border-night-border p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-night-bg font-bold rounded-lg hover:bg-primary/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-night-panel focus-visible:ring-primary"
          >
            Fechar
          </button>
        </div>
      </aside>
    </div>
  );
};

/**
 * Shortcut Item Component
 * Displays a single keyboard shortcut with description
 */
interface ShortcutItemProps {
  keys: string[];
  action: string;
  description: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({
  keys,
  action,
  description,
}) => {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg bg-night-bg/50 hover:bg-night-bg transition-colors">
      <div className="flex gap-1 flex-wrap">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-slate-500 text-sm">+</span>}
            <kbd className="px-2 py-1 bg-night-panel border border-night-border rounded text-xs font-mono font-semibold text-slate-200">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-100">{action}</div>
        <div className="text-sm text-slate-400 mt-0.5">{description}</div>
      </div>
    </div>
  );
};
