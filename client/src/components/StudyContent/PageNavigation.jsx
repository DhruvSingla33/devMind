const PageNavigation = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext
}) => {

  const isFirstPage =
    currentPage === 0;

  const isLastPage =
    currentPage === totalPages - 1;


  return (
    <footer className="page-navigation">

      <button
        className="navigation-button previous"
        disabled={isFirstPage}
        onClick={onPrevious}
      >
        ← Previous
      </button>


      <div className="navigation-page">

        <span>
          Page
        </span>

        <strong>
          {currentPage + 1}
        </strong>

        <span>
          of {totalPages}
        </span>

      </div>


      <button
        className="navigation-button next"
        disabled={isLastPage}
        onClick={onNext}
      >
        Next →
      </button>

    </footer>
  );
};

export default PageNavigation;