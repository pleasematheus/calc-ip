import { useEffect, useState } from "react"
import "./output.css"

export default function App() {
  const [ip, setIp] = useState("")
  const [subnets, setSubnets] = useState(1)
  const [result, setResult] = useState({})

  useEffect(() => {
    if (ip) {
      calculateNetwork(ip, subnets)
    }
  }, [ip, subnets])

  const calculateNetwork = (ip, subnets) => {
    const subnet = determineSubnet(subnets)
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

    const numHosts = Math.pow(2, 32 - subnetToCidr(subnet)) - 2
    const ipBinary = convertToBinary(ipParts)

    setResult({
      networkAddress,
      broadcastAddress,
      firstHost,
      lastHost,
      ipClass,
      subnetMask: subnet,
      numHosts,
      ipBinary,
    })
  }

  const determineSubnet = (subnets) => {
    const defaultSubnet = "255.255.255.0" // Classe C padrão
    const cidr = 24 + Math.ceil(Math.log2(subnets)) // Incrementa o CIDR com base no número de subredes

    return cidrToSubnet(cidr) || defaultSubnet
  }

  const cidrToSubnet = (cidr) => {
    const mask = []
    for (let i = 0; i < 4; i++) {
      const bits = Math.min(8, cidr)
      mask.push((256 - Math.pow(2, 8 - bits)) % 256)
      cidr -= bits
    }
    return mask.join(".")
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

  const convertToBinary = (ipParts) => {
    return ipParts.map((part) => part.toString(2).padStart(8, "0")).join(".")
  }

  const subnetToCidr = (subnet) => {
    return subnet
      .split(".")
      .map(Number)
      .reduce(
        (cidr, octet) => cidr + octet.toString(2).replace(/0/g, "").length,
        0
      )
  }

  return (
    <div className="grid place-items-center min-h-screen p-4">
      <div className="w-full sm:w-1/2 max-w-xs border-solid border-2 border-sky-500 p-3 rounded-xl">
        <div className="mb-4">
          <label className="text-center text-3xl block text-white familjen-grotesk-700 font-bold mb-2">
            Calculadora de IP
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="text-center familjen-grotesk-400 shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:ring-4 focus:ring-sky-500 focus:outline-none focus:shadow-outline hover:border-blue-600 transition-all duration-300 bg-[#242424] text-[#ffffffde] caret-sky-500"
            placeholder="Endereço IP (exemplo 192.168.0.103)"
            aria-label="endereco"
          />
        </div>
        <div className="mb-4">
          <label className="text-white familjen-grotesk-400">
            Quantidade de subredes:
          </label>
          <select
            value={subnets}
            onChange={(e) => setSubnets(Number(e.target.value))}
            className="w-full py-2 px-3 bg-[#242424] text-white border rounded focus:ring-4 focus:ring-sky-500 focus:outline-none"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={32}>32</option>
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
          </select>
        </div>
        <hr className="mb-2" />
        <div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Classe do IP:</p>
            <p className="text-white familjen-grotesk-400">
              {result.ipClass || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">
              Máscara de sub-rede:
            </p>
            <p className="text-white familjen-grotesk-400">
              {result.subnetMask || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Endereço de rede:</p>
            <p className="text-white familjen-grotesk-400">
              {result.networkAddress || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">
              Endereço Broadcast:
            </p>
            <p className="text-white familjen-grotesk-400">
              {result.broadcastAddress || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Primeiro Host:</p>
            <p className="text-white familjen-grotesk-400">
              {result.firstHost || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Último Host:</p>
            <p className="text-white familjen-grotesk-400">
              {result.lastHost || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Número de Hosts:</p>
            <p className="text-white familjen-grotesk-400">
              {result.numHosts || "-"}
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-center text-white familjen-grotesk-700 mb-2">
              IP em Binário
            </h3>
            <p className="text-white familjen-grotesk-400">
              {result.ipBinary || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}