import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

export const appMetaTags = (title?: string) => {
  const description =
    'Join Nomia Signatures, the open signing infrastructure, and get a 10x better signing experience. Sign in now and enjoy a faster, smarter, and more beautiful document signing process.';

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
        'Nomia Signatures, open source, DocuSign alternative, document signing, open signing infrastructure, open-source community, fast signing, beautiful signing, smart templates',
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
      content: 'Nomia Signatures - The  DocuSign Alternative',
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
