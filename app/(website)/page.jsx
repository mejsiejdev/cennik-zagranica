"use client";
import { config } from "@/config/config";
import Link from "next/link";
import { country } from "@/lib/utils";

const BasePage = () => {
	const availLangs = [...new Set(config.source.map((src) => src.lang))];
	return (
		<div className="h-screen flex flex-col items-center justify-center">
			<h1 className="text-7xl font-bold mb-8">Prices Podlasiak</h1>
			<p className="mb-4 uppercase font-medium">Countries:</p>
			<div className="grid grid-cols-6 items-center gap-2">
				{availLangs.map((avail) => (
					<Link
						className="py-2 px-4 text-center hover:underline"
						key={avail}
						href={`/${avail}`}
					>
						{country(avail)}
					</Link>
				))}
			</div>
		</div>
	);
};

export default BasePage;
