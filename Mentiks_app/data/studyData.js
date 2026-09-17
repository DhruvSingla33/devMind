export const studyData = {
  chapter: {
    id: "chapter-1",
    subject: "Biology 12th",
    title: "Sexual Reproduction in Flowering Plants",
    totalPages: 3
  },

  pages: [
    {
      id: "page-1",
      pageNumber: 1,

      sections: [
        {
          id: "intro",
          heading: "Introduction to Sexual Reproduction",

          content: [
            {
              type: "text",
              value:
                "Reproduction is a vital biological process through which organisms produce offspring. It ensures the continuity of species across generations."
            },

            {
              type: "text",
              value:
                "In flowering plants, reproduction involves specialized structures of the flower."
            }
          ]
        },

        {
          id: "flower",
          heading: "Structure of a Flower",

          content: [
            {
              type: "text",
              value:
                "A typical flower consists of four major whorls: calyx, corolla, androecium and gynoecium."
            },

            {
              type: "image",
              src: "https://example.com/flower.png",
              alt: "Structure of a flower"
            }
          ]
        }
      ],

      mcqs: [
        {
          id: "q1",
          question:
            "Which of the following best explains why reproduction is considered a vital biological process for a species?",

          options: [
            "It ensures the species' survival across generations.",
            "It helps individual organisms adapt to changing environments.",
            "It reduces variation among offspring.",
            "It minimizes competition for resources."
          ],

          correctAnswer: 0,
          difficulty: "Easy",
          marks: 4
        },

        {
          id: "q2",
          question:
            "What are the two principal modes of reproduction?",

          options: [
            "Budding and fragmentation",
            "Asexual and sexual means",
            "Binary fission and budding",
            "Vegetative and reproductive"
          ],

          correctAnswer: 1,
          difficulty: "Easy",
          marks: 4
        }
      ]
    },

    {
      id: "page-2",
      pageNumber: 2,

      sections: [
        {
          id: "pollination",
          heading: "Pollination",

          content: [
            {
              type: "text",
              value:
                "Pollination is the transfer of pollen grains from the anther to the stigma of a flower."
            },

            {
              type: "image",
              src: "https://example.com/pollination.png",
              alt: "Pollination process"
            }
          ]
        },

        {
          id: "types",
          heading: "Types of Pollination",

          content: [
            {
              type: "text",
              value:
                "Pollination can broadly be classified into self-pollination and cross-pollination."
            },

            {
              type: "table",
              columns: ["Type", "Description"],
              rows: [
                [
                  "Self-pollination",
                  "Transfer of pollen within the same flower or plant."
                ],
                [
                  "Cross-pollination",
                  "Transfer of pollen from one plant to another plant."
                ]
              ]
            }
          ]
        }
      ],

      mcqs: [
        {
          id: "q3",
          question: "What is pollination?",

          options: [
            "Fusion of gametes",
            "Transfer of pollen to stigma",
            "Formation of seeds",
            "Development of fruit"
          ],

          correctAnswer: 1,
          difficulty: "Medium",
          marks: 4
        }
      ]
    },

    {
      id: "page-3",
      pageNumber: 3,

      sections: [
        {
          id: "fertilization",
          heading: "Fertilization",

          content: [
            {
              type: "text",
              value:
                "Fertilization is the process of fusion of male and female gametes to form a zygote."
            }
          ]
        }
      ],

      mcqs: []
    }
  ]
};