import prisma from "@/db";
import { country, matchPath } from "@/lib/utils";
import { main } from "prisma/preinstall";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Password from "@/components/Password";
import { DataTable } from "@/components/DataTable";

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

	let products = await prisma.product.findMany({
		include: {
			ProductTitle: {
				where: {
					lang: params.lang,
				},
			},
		},
	});
	const preparedProducts = products
		.filter((product) => product.ProductTitle.length !== 0)
		.map((prod) => {
			const { variantId, sku, ean, brand } = prod;
			return {
				variantId,
				sku,
				ean,
				brand,
				name: prod.ProductTitle[0].name,
				lang: prod.ProductTitle[0].lang,
				price: {
					newPrice: prod.ProductTitle[0].newPrice,
					oldPrice: prod.ProductTitle[0].oldPrice,
					priceDifference: prod.ProductTitle[0].priceDifference,
				},
			};
		});

	const productWithPriceDifference = preparedProducts.filter(
		(product) =>
			product.price.priceDifference > 0 || (product.price.priceDifference < 0 && true),
	);
	const productWithoutPriceDifference = preparedProducts.filter(
		(product) => product.price.priceDifference === 0 && true,
	);

	return (
		<main className="p-12">
			<h1 className="text-3xl uppercase font-bold">{country(params.lang)}</h1>
			<DataTable
				data={[...productWithPriceDifference, ...productWithoutPriceDifference]}
				lang={params.lang}
			/>
		</main>
	);
};

export default LangPage;
