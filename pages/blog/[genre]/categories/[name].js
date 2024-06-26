import Head from "next/head";
import Link from "next/link";
import { Text } from "../detail/[id].js"
import { getDatabase } from "../../../../lib/notion.js";
import Layout from '../../../../components/layout.js'
import { GENRES, GENRE_TITLE_MAP } from "../../../../const/index.js";
import { createDatabaseId } from "../../../../utils/index.js";
import Side from "../../../../components/parts/widget/side.js";

export default function Tags({ posts, tagList, genre, pageTitle, tagName }) {
  return (
    <Layout>
      <Head>
        <title>{tagName} / {pageTitle} - KBWord - </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mt-5">
        <div className="row">
          <section className="col-lg-8">
            <div className="row gx-4 gx-lg-5 row-cols-sm-2 row-cols-1 justify-content-center">
              {posts.map((post) => {
                const date = new Date(post.last_edited_time).toLocaleString(
                  "ja",
                  {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }
                );
                return (
                    <div className="col-6 mb-5" key={post.id}>
                        <div className="card h-100">
                            <img className="card-img-top border-bottom img-responsive" src={post.properties.Image.url} alt="..." />
                            <div className="card-body p-4">
                                <div className="text-center">
                                    <h5 className="fw-bolder"><Text text={post.properties.Name.title} /></h5>
                                    <div className="flex-column justify-content-center small text-warning mb-2">
                                      {post.properties.Tags.multi_select.map((tag) => {
                                        return (
                                          <Link href={`/blog/${genre}/categories/${tag.name}/`} className=" btn btn-outline-secondary m-1"  key={tag.id}>{tag.name}</Link>
                                        )
                                      })}
                                    </div>
                                    {date}
                                </div>
                            </div>
                            <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                <div className="text-center">
                                  <Link className="btn btn-outline-dark mt-auto link"  href={`/blog/${genre}/detail/${post.id}/`}>記事を読む</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                );
              })}
            </div>
          </section>
          {/* Side widgets*/}
          <section className="col-lg-4">
            <Side />
            {/* Categories widget*/}
            <div className="card mb-4">
                <div className="card-header  bg-dark text-white"><i className="bi bi-tags m-1"></i>Categories</div>
                <div className="card-body">
                    <div className="row">
                        <div className="container">
                            <div className="row">
                              {tagList.map((tag) => {
                                return (
                                  <div className="col-3" style={{width:'fit-content'}}><Link href={`/blog/${genre}/categories/${tag}`} className="col  btn btn-outline-secondary m-1"  key={tag}>{tag}</Link></div>
                                )
                              })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </section>
        </div>{/* .row */}
      </div>{/* .container */}
    </Layout>
  );
}

export const getStaticPaths = async () => {
  let params = []
  for(const genre of GENRES){

    let databaseId = createDatabaseId(genre)
    const database = await getDatabase(databaseId)
    let tagList = []
    database.map((item) => {
      if(!item){
        return
      }
      item.properties.Tags.multi_select.map((tag) => {
        if(tagList.indexOf(tag.name) < 0){
          let param = {genre : genre, name : tag.name}
          params.push({params: param})
        }
      })

    })
  }

  return {
    paths: params,
    fallback: false,
  };
};


export const getStaticProps = async (context) => {
  const { genre, name } = context.params;

  const pageTitle = GENRE_TITLE_MAP[genre]
  
  let databaseId = createDatabaseId(genre)
  const database = await getDatabase(databaseId)

  let tagList = []
  
  for(const item of database) {
    if(!item){
      continue
    }
    item.properties.Tags.multi_select.map((tag) => {
      if(tagList.indexOf(tag.name) < 0){
        tagList.push(tag.name)
      }
    })
  }

  let posts = []

  database.map(p => {
    let match = false
    p.properties.Tags.multi_select.map(tag => {
      if(tag.name == name) {
        match = true
        return false;
      }
    })
    if(match){
      posts.push(p)
    }
  })

  return {
    props: {
      posts: posts,
      tagList: tagList,
      genre: genre,
      pageTitle: pageTitle,
      tagName : name
    },
    revalidate: 1
  };
};
