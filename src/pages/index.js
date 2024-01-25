import Head from 'next/head';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';

import styles from '@styles/Home.module.scss';

export default function Home({ countries, positions }) {
  return (
    <Layout>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>
            Next.js Leaflet
          </h1>

          <Map width="800" height="400" bounds={positions} zoom={12}>
            {({ TileLayer, Marker, Popup }) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {countries.map((c) => (
                  <Marker key={c.code} position={[c.lat, c.long]}>
                    <Popup>
                     {c.name}
                    </Popup>
                  </Marker>
                ))}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  )
}

export async function getStaticProps() {

  const listCountries = (await import('./api/countries.json')).default;

  const client = new ApolloClient({
    uri: 'https://countries.trevorblades.com/',
    cache: new InMemoryCache()
  });

  const points = {}
  const filter = listCountries.map((country) => {
    points[country["ISO Code"]] = { lat: country.Latitude, long: country.Longitude } 
    return country["ISO Code"];
  })

  const { data } = await client.query({
    query: gql`
      query GetCountries {
        countries(filter: { code: { in: [${'"'}${filter.join('", "')}${'"'}] } }) {
          code
          name
        }
      }
    `
  });

  return {
    props: {
      countries: data.countries.map(item => ({ ...item, ...points[item.code]})),
      positions: Object.keys(points).map(key => ([[points[key].lat, points[key].long]]))
    }
  }
}