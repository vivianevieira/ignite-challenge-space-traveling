import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  return (
    <>
      <Head>
        <title>Post title | spacetravelling</title>
      </Head>
      <div className={commonStyles.contentContainer}>
        <Header />
      </div>

    </>

  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author']
  });

  return {
    paths: [{ params: { slug: '1' } }, { params: { slug: '2' } }],
    fallback: true
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
  data: {
    title: response.data.title,
    banner: {
      url: response.data
    },
    author: response.data.author,
    content: {
      heading: string;
      body: {
        text: string;
      },
    },
  }
  }

  return {
    props: {
      post
    }
  }
};
