import ContentBlock from "./ContentBlock";

const PageRenderer = ({ page }) => {
  return (
    <article className="page-renderer">

      {page.sections.map((section) => (

        <section
          key={section.id}
          className="content-section"
        >

          <h2>
            {section.heading}
          </h2>


          <div className="section-content">

            {section.content?.map((item, index) => (

              <ContentBlock
                key={`${section.id}-${index}`}
                item={item}
              />

            ))}

          </div>

        </section>

      ))}

    </article>
  );
};

export default PageRenderer;