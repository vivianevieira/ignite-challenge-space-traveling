import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

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

export default function Home() {
  return(
    <>
      <div className={commonStyles.contentContainer}>
        <Header />
        <a href="#">Link</a>
        <p>Vivi</p>
      </div>

    </>
  );

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
}
