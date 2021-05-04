import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Header from '../components/Header'
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
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  async function handleMorePostsLink(url: string) {
    const response = await fetch(url);
    const data = await response.json();

    const newPosts = data.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  setPosts({
    next_page: data.next_page,
    results: [...posts.results, ...newPosts]
  })

  }

  useEffect(() => {
    setPosts(postsPagination)
  }, []);

  return(
    <>
    <Head>
      <title>Home | spacetravelling</title>
    </Head>
      <div>
        <Header />
        <main className={styles.container}>
          <div className={styles.posts}>
            {posts.results.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                  <a>
                    <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.icons}>
                    <p>
                      <span><FiCalendar /></span>
                      {format(new Date(new Date(post.first_publication_date)),
                      'dd MMM yyyy', {locale: ptBR})}
                    </p>
                    <p>
                      <span className={styles.iconLeftMargin}><FiUser /></span>
                      {post.data.author}
                    </p>
                  </div>
                  </a>
              </Link>

            ))}
          {
          posts.next_page
            ? <div className={styles.loadMoreLink}>
                <Link href="#">
                  <a onClick={() => handleMorePostsLink(posts.next_page)}>Carregar mais posts</a>
                </Link>
              </div>
            : null
          }
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
    pageSize: 2
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
