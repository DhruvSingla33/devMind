import { useState } from "react";

const MCQCard = ({
  question,
  questionNumber
}) => {

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [showAnswer, setShowAnswer] =
    useState(false);


  return (
    <div className="mcq-card">

      {/* Question metadata */}

      <div className="mcq-meta">

        <span className="mcq-type">
          ◉ MCQ
        </span>

        <span className="difficulty">
          {question.difficulty}
        </span>

        <span className="marks">
          {question.marks} marks
        </span>

      </div>


      {/* Question */}

      <div className="mcq-question">

        <span className="question-number">
          {questionNumber}.
        </span>

        <span>
          {question.question}
        </span>

      </div>


      {/* Options */}

      <div className="mcq-options">

        {question.options.map((option, index) => {

          const isSelected =
            selectedAnswer === index;

          const isCorrect =
            question.correctAnswer === index;


          return (
            <button
              key={index}
              className={`
                mcq-option
                ${isSelected ? "selected" : ""}
                ${
                  showAnswer && isCorrect
                    ? "correct"
                    : ""
                }
              `}
              onClick={() => setSelectedAnswer(index)}
            >

              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>

              <span>
                {option}
              </span>

            </button>
          );

        })}

      </div>


      {/* Answer */}

      <button
        className="show-answer"
        onClick={() =>
          setShowAnswer((prev) => !prev)
        }
      >

        {showAnswer
          ? "Hide Answer ▲"
          : "Show Answer ▼"}

      </button>


      {showAnswer && (

        <div className="answer">

          <strong>
            Answer:
          </strong>{" "}

          {String.fromCharCode(
            65 + question.correctAnswer
          )}

        </div>

      )}

    </div>
  );
};

export default MCQCard;