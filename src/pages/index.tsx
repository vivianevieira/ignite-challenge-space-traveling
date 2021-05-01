import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import Header from '../components/Header'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results } = postsPagination;

  console.log(postsPagination)
  return(
    <>
    <Head>
      <title>Home | spacetravelling</title>
    </Head>
      <div className={commonStyles.contentContainer}>
        <Header />
        <main>
          <div>
            {results.map(post => (
              <Link href={`/posts/${post.uid}`} key={post.uid}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                </a>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 5
  })

  const next_page = postsResponse.next_page;

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination = {
    next_page: next_page,
    results: posts
  }

  return {
    props: {
      postsPagination
    }
  }
}
