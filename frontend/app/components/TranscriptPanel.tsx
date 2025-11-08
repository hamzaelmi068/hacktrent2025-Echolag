interface TranscriptPanelProps {
  title: string;
  placeholderText?: string;
  content?: string;
}

const TranscriptPanel = ({
  title,
  placeholderText = "Transcript text will appear here once the session begins.",
  content,
}: TranscriptPanelProps) => {
  const displayText =
    typeof content === "string" && content.trim().length > 0
      ? content
      : placeholderText;

  return (
    <div className="flex flex-col gap-3">
      {title && <h3 className="text-lg font-semibold" style={{ color: '#4A3F35' }}>{title}</h3>}
      <div 
        className="rounded-lg border border-dashed p-4 text-sm leading-relaxed"
        style={{
          borderColor: '#D4A574',
          backgroundColor: '#FDFCFA',
          color: '#6B5D52'
        }}
      >
        <p>{displayText}</p>
      </div>
    </div>
  );
};

export default TranscriptPanel;

