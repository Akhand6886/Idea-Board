/* ── Shared style objects for IdeaOS components ── */

export const inp = {
  background: 'var(--bg-input-inner)',
  border: '1px solid var(--border-main)',
  borderRadius: 7,
  padding: '7px 11px',
  color: 'var(--text-main)',
  fontSize: 13,
  outline: 'none',
};

export const addBtn = (color) => ({
  background: color,
  color: '#000',
  border: 'none',
  borderRadius: 7,
  padding: '0 14px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
  flexShrink: 0,
});

export const iconBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 3,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
};

export const sectionHeader = {
  padding: '16px 22px 12px',
  borderBottom: '1px solid var(--border-subtle)',
};

export const inputRow = {
  padding: '12px 22px',
  borderBottom: '1px solid var(--border-subtle)',
  display: 'flex',
  gap: 8,
};
