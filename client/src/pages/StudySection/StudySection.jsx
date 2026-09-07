import { useState } from "react";

import ModuleHeader from "../../components/StudyContent/ModuleHeader";
import PageRenderer from "../../components/StudyContent/PageRenderer";
import MCQPanel from "../../components/StudyContent/MCQPanel";
import PageNavigation from "../../components/StudyContent/PageNavigation";

const StudySection = ({ studyData }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pages = studyData.pages;

  const currentPage = pages[currentPageIndex];

  const handleNext = () => {
    setCurrentPageIndex((prev) => {
      if (prev >= pages.length - 1) {
        return prev;
      }

      return prev + 1;
    });
  };

  const handlePrevious = () => {
    setCurrentPageIndex((prev) => {
      if (prev <= 0) {
        return prev;
      }

      return prev - 1;
    });
  };

  return (
    <div className="study-section">

      {/* Header */}

      <ModuleHeader
        chapter={studyData.chapter}
        currentPage={currentPage.pageNumber}
        totalPages={pages.length}
      />


      {/* Main Study Area */}

      <div className="study-content">

        {/* Left - Book/Page */}

        <main className="study-page">

          <PageRenderer
            page={currentPage}
          />

        </main>


        {/* Right - MCQs */}

        <aside className="study-mcq">

          <MCQPanel
            questions={currentPage.mcqs || []}
          />

        </aside>

      </div>


      {/* Bottom Navigation */}

      <PageNavigation
        currentPage={currentPageIndex}
        totalPages={pages.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

    </div>
  );
};

export default StudySection;