import DataTable from "./DataTable";

const ContentBlock = ({ item }) => {

  switch (item.type) {

    case "text":
      return (
        <p className="content-text">
          {item.value}
        </p>
      );


    case "image":
      return (
        <figure className="content-image-wrapper">

          <img
            src={item.src}
            alt={item.alt || ""}
            className="content-image"
          />

          {item.caption && (
            <figcaption>
              {item.caption}
            </figcaption>
          )}

        </figure>
      );


    case "table":
      return (
        <DataTable
          columns={item.columns}
          rows={item.rows}
        />

      );


    case "list":
      return (
        <ul className="content-list">

          {item.items.map((listItem, index) => (
            <li key={index}>
              {listItem}
            </li>
          ))}

        </ul>
      );


    default:
      return null;
  }
};

export default ContentBlock;