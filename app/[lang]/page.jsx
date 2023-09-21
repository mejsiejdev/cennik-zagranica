import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import prisma from "@/db";
import { currencyMapping } from "@/lib/utilities";

const LangPage = async ({ params }) => {
	const products = await prisma.product.findMany({
		include: {
			ProductTitle: {
				where: {
					lang: params.lang,
				},
			},
		},
	});

	return (
		<Table className="border relative text-black">
			<TableHeader>
				<TableRow className="sticky top-0">
					<TableHead className="w-[3%] bg-gray-200 text-center">No.</TableHead>
					<TableHead className="w-[4%] bg-gray-200 text-center">ID</TableHead>
					<TableHead className="w-[5%] bg-gray-200">SKU</TableHead>
					<TableHead className="w-[5%] bg-gray-200">EAN</TableHead>
					<TableHead className="w-[5%] bg-gray-200">BRAND</TableHead>
					<TableHead className="w-[53%] bg-gray-200">TITLE</TableHead>
					<TableHead className="w-[10%] bg-gray-200 text-right">PRICE</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{products.map((product, index) => {
					const setPriceColor = () => {
						if (product.ProductTitle[0].newPrice > product.ProductTitle[0].oldPrice)
							return "text-black bg-green-300";
						if (product.ProductTitle[0].newPrice < product.ProductTitle[0].oldPrice)
							return "text-black bg-red-300";
						if (product.ProductTitle[0].newPrice === product.ProductTitle[0].oldPrice)
							return "text-black bg-white content-['dupa']";
					};
					const setPriceContent = () => {
						if (product.ProductTitle[0].newPrice > product.ProductTitle[0].oldPrice)
							return "▲";
						if (product.ProductTitle[0].newPrice < product.ProductTitle[0].oldPrice)
							return "▼";
						if (product.ProductTitle[0].newPrice === product.ProductTitle[0].oldPrice)
							return "";
					};
					const price = new Intl.NumberFormat(params.lang, {
						style: "currency",
						currency: currencyMapping(params.lang),
					}).format(product.ProductTitle[0].newPrice);
					return (
						<TableRow key={product.id}>
							<TableCell className={`${setPriceColor()} text-center`}>
								{index + 1}
							</TableCell>
							<TableCell className={`${setPriceColor()} text-center`}>
								{product.variantId}
							</TableCell>
							<TableCell className={`${setPriceColor()}`}>
								{product.sku.toUpperCase()}
							</TableCell>
							<TableCell className={`${setPriceColor()}`}>{product.ean}</TableCell>
							<TableCell className={`${setPriceColor()}`}>{product.brand}</TableCell>
							<TableCell className={`${setPriceColor()}`}>
								{product.ProductTitle[0].name}
							</TableCell>
							<TableCell className={`${setPriceColor()} text-right font-medium`}>
								{`${setPriceContent()} ${price}`}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export default LangPage;
