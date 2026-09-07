import MCQCard from "./MCQCard";

const MCQPanel = ({ questions }) => {
  return (
    <div className="mcq-panel">

      <div className="mcq-header">

        <div className="mcq-title">
          <span className="status-dot" />

          <span>
            High-Probability Exam Questions
          </span>

          <span className="cached-badge">
            cached
          </span>
        </div>


        <div className="mcq-filter">

          <button className="active">
            ALL
          </button>

          <button>
            NEET
          </button>

        </div>

      </div>


      {questions.length === 0 ? (

        <div className="empty-mcq">
          No questions available for this page.
        </div>

      ) : (

        <div className="mcq-list">

          {questions.map((question, index) => (

            <MCQCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
            />


          ))}

        </div>

      )}

    </div>
  );
};

export default MCQPanel;