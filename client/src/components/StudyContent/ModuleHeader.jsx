const ModuleHeader = ({
  chapter,
  currentPage,
  totalPages
}) => {
  return (
    <header className="chapter-header">

      <div className="chapter-left">

        <div className="subject">
          📘 {chapter.subject}
        </div>

        <div className="chapter-title">
          {chapter.title}
        </div>

      </div>


      <div className="chapter-right">

        <div className="page-counter">
          Page {currentPage} / {totalPages}
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${(currentPage / totalPages) * 100}%`
            }}
          />
        </div>

      </div>

    </header>
  );
};

export default ModuleHeader;