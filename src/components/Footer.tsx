
const Footer = () => {
    return (
        <footer>
            <div className="flex flex-col gap-2 items-center justify-center py-8 text-sm">
                <p>Queer Club Directory is an online database of LGBTQ+ clubs and organizations in Toronto.</p>
                <p>
                    Created by <a href="https://www.roneilla.com" target="_blank" rel="noopener noreferrer" className="underline">Roneilla Bumanlag</a> © {new Date().getFullYear()} Queer Club Directory
                </p>

            </div>
        </footer>
    )
}

export default Footer