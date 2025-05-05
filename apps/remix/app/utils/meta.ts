import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

export const appMetaTags = (title?: string) => {
  const description =
    'Streamline your document signing with Nomia’s intuitive e-signature platform. Quick, easy, and secure, our solution makes e-signing effortless and affordable. Create reusable templates, manage individual or bulk signings, track document status, and send reminders—all within a seamless, integrated workflow.';

  return [
    {
      title: "Nomia Signatures",
    },
    {
      name: 'description',
      content: description,
    },
    {
      name: 'keywords',
      content:
        'Nomia Signatures, DocuSign alternative, document signing, open signing infrastructure, open-source community, fast signing, beautiful signing, smart templates  ,fast and secure signing platform , nomiadocs',
    },
    {
      name: 'author',
      content: 'Nomia Signatures, Inc.',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      property: 'og:title',
      content: 'Nomia E-Signatures – Fast, Smart, and Secure',
    },
    {
      property: 'og:description',
      content: description,
    },
    // {
    //   property: 'og:image',
    //   content: `${NEXT_PUBLIC_WEBAPP_URL()}/opengraph-image.jpg`,
    // },
    {
      property: 'og:type',
      content: 'website',
    },
    // {
    //   name: 'twitter:card',
    //   content: 'summary_large_image',
    // },
    // {
    //   name: 'twitter:site',
    //   content: '@documenso',
    // },
    // {
    //   name: 'twitter:description',
    //   content: description,
    // },
    // {
    //   name: 'twitter:image',
    //   content: `${NEXT_PUBLIC_WEBAPP_URL()}/opengraph-image.jpg`,
    // },
  ];
};
