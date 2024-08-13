import { useEffect, useState } from "react"
import "./output.css"

export default function App() {
  const [ip, setIp] = useState("")
  const [result, setResult] = useState({})

  useEffect(() => {
    if (ip) {
      calculateNetwork(ip)
    }
  }, [ip])

  const calculateNetwork = (ip) => {
    const subnet = determineSubnet(ip)
    const ipParts = ip.split(".").map(Number)
    const subnetParts = subnet.split(".").map(Number)

    const networkAddress = ipParts
      .map((part, index) => part & subnetParts[index])
      .join(".")
    const broadcastAddress = ipParts
      .map(
        (part, index) =>
          (part & subnetParts[index]) | (~subnetParts[index] & 255)
      )
      .join(".")

    const firstHost = networkAddress
      .split(".")
      .map((part, index) => (index === 3 ? Number(part) + 1 : part))
      .join(".")
    const lastHost = broadcastAddress
      .split(".")
      .map((part, index) => (index === 3 ? Number(part) - 1 : part))
      .join(".")

    const ipClass = determineIpClass(ipParts[0])

    setResult({
      networkAddress,
      broadcastAddress,
      firstHost,
      lastHost,
      ipClass,
    })
  }

  const determineSubnet = (ip) => {
    const firstOctet = Number(ip.split(".")[0])
    if (firstOctet >= 1 && firstOctet <= 126) {
      return "255.0.0.0" // Classe A
    } else if (firstOctet >= 128 && firstOctet <= 191) {
      return "255.255.0.0" // Classe B
    } else if (firstOctet >= 192 && firstOctet <= 223) {
      return "255.255.255.0" // Classe C
    }
    return "255.255.255.0" // Substituto padrão
  }

  const determineIpClass = (firstOctet) => {
    if (firstOctet >= 1 && firstOctet <= 126) {
      return "Classe A"
    } else if (firstOctet >= 128 && firstOctet <= 191) {
      return "Classe B"
    } else if (firstOctet >= 192 && firstOctet <= 223) {
      return "Classe C"
    } else if (firstOctet >= 224 && firstOctet <= 239) {
      return "Classe D"
    } else if (firstOctet >= 240 && firstOctet <= 255) {
      return "Classe E"
    }
    return "Desconhecida"
  }

  return (
    <div className="grid place-items-center min-h-screen p-4">
      <div className="w-1/2 max-w-xs border-solid border-2 border-sky-500 p-3 rounded-xl">
        <div className="mb-4">
          <label className="text-center text-2xl block text-white text-sm familjen-grotesk-700 font-bold mb-2">
            Endereço IP
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="text-center familjen-grotesk-400 shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:ring-4 focus:ring-blue-500 focus:outline-none focus:shadow-outline hover:border-blue-500 transition-colors transition-shadow duration-300"
            placeholder="Endereço IP (exemplo 192.168.0.1)"
            aria-label="endereco"
          />
        </div>
        <hr className="mb-2" />
        <div>
          <p className="text-white familjen-grotesk-400">
            Classe do IP: {result.ipClass || "-"}
          </p>
          <p className="text-white familjen-grotesk-400">
            Endereço de rede: {result.networkAddress || "-"}
          </p>
          <p className="text-white familjen-grotesk-400">
            Endereço Broadcast: {result.broadcastAddress || "-"}
          </p>
          <p className="text-white familjen-grotesk-400">
            Primeiro Host: {result.firstHost || "-"}
          </p>
          <p className="text-white familjen-grotesk-400">
            Último Host: {result.lastHost || "-"}
          </p>
        </div>
      </div>
    </div>
  )







}