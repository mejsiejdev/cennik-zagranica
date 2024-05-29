import prisma from "@/db";
import { country, matchPath } from "@/lib/utils";
import { main } from "prisma/preinstall";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Password from "@/components/Password";
import { DataTable } from "@/components/DataTable";
import convert from "xml-js";
import { createReadStream } from "fs";
import { Buffer } from "buffer";

const LangPage = async ({ params }) => {
	if (!matchPath(params.lang)) return notFound();

	const cookieStore = cookies();
	const cookieLang = cookieStore.get("lang")?.value || "";
	const cookieAuth = cookieStore.get("authorized")?.value
		? JSON.parse(cookieStore.get("authorized")?.value)
		: false;

	if (!cookieAuth)
		return (
			<main>
				<Password lang={params.lang} />
			</main>
		);
	if (cookieLang !== params.lang)
		return (
			<main>
				<Password lang={params.lang} />
			</main>
		);

	/*
	let products = await prisma.product.findMany({
		include: {
			productTitle: {
				where: {
					lang: params.lang,
				},
			},
		},
	});
	const preparedProducts = products
		.filter((product) => product.productTitle.length !== 0)
		.map((prod) => {
			const { variantId, sku, ean, brand } = prod;
			return {
				variantId,
				sku,
				ean,
				brand,
				name: prod.productTitle[0].name,
				lang: prod.productTitle[0].lang,
				price: {
					newPrice: prod.productTitle[0].newPrice,
					oldPrice: prod.productTitle[0].oldPrice,
					priceDifference: prod.productTitle[0].priceDifference,
				},
			};
		});

	const productWithPriceDifference = preparedProducts.filter(
		(product) =>
			product.price.priceDifference > 0 || (product.price.priceDifference < 0 && true)
	);
	const productWithoutPriceDifference = preparedProducts.filter(
		(product) => product.price.priceDifference === 0 && true
	);
	*/

	console.log(`${process.cwd().replace(/\\/g, "/")}/public/test.xml`);

	/*
	const data = convert.xml2js(xmlData, {
		compact: true,
		spaces: 2
	})*/

	/* Uwaga: żeby porównywać ceny, wychodzi na to, że trzeba będzie zapisać cały poprzedni xml... */
	/* Uwaga: ten XML jest za duży, by go wczytać w taki sposób - trzeba to zrobić kawałek po kawałku. */
	/*const xml = await fs.readFile(`${process.cwd().replace(/\\/g, "/")}/public/feed.xml`, 'utf8')*/
	//const data = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 2}))

	const readStream = createReadStream(`${process.cwd().replace(/\\/g, "/")}/public/feed.xml`, {
		highWaterMark: 64 * 1024,
	});

	// Strings are too short for gigantic XMLs
	let data = [];

	// magic
	await (async function () {
		for await (const chunk of readStream) {
			data.push(chunk.toString());
		}
	})();

	// Note: it seems like the only way this thing can be processed is by splitting and rearranging this whole file.

	return (
		<main className="p-10">
			<h1 className="text-3xl uppercase font-bold">{country(params.lang)}</h1>
			{/*
			<DataTable
				data={[...productWithPriceDifference, ...productWithoutPriceDifference]}
				lang={params.lang}
			/>
		*/}
		</main>
	);
};

export default LangPage;
