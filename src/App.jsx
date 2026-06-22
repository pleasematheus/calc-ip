import { useMemo, useState } from "react"
import "./input.css"

const generateRandomIp = () => {
  const oct = (min = 0, max = 255) => Math.floor(Math.random() * (max - min + 1)) + min
  return `${oct(1, 223)}.${oct()}.${oct()}.${oct(1, 254)}`
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
  if (firstOctet >= 1 && firstOctet <= 126) return "Classe A"
  if (firstOctet >= 128 && firstOctet <= 191) return "Classe B"
  if (firstOctet >= 192 && firstOctet <= 223) return "Classe C"
  if (firstOctet >= 224 && firstOctet <= 239) return "Classe D"
  if (firstOctet >= 240 && firstOctet <= 255) return "Classe E"
  return "Desconhecida"
}

const convertToBinary = (ipParts) =>
  ipParts.map((part) => part.toString(2).padStart(8, "0")).join(".")

const ipToDecimal = (ip) =>
  ip
    .split(".")
    .reduce(
      (decimal, octet, index) => decimal + Number(octet) * Math.pow(256, 3 - index),
      0
    )

const decimalToIp = (decimal) =>
  Array.from(
    { length: 4 },
    (_, i) => Math.floor(decimal / Math.pow(256, 3 - i)) % 256
  ).join(".")

const incrementIp = (ip) => decimalToIp(ipToDecimal(ip) + 1)
const decrementIp = (ip) => decimalToIp(ipToDecimal(ip) - 1)

const calculateSubnets = (networkAddress, cidr, subnets) => {
  const bitsNeeded = subnets === 1 ? 0 : Math.ceil(Math.log2(subnets))
  if (cidr + bitsNeeded > 32) return []

  const subnetsInfo = []
  const increment = Math.pow(2, 32 - (cidr + bitsNeeded))
  let currentNetworkAddress = ipToDecimal(networkAddress)

  for (let i = 0; i < subnets; i++) {
    const subnetNetworkAddress = decimalToIp(currentNetworkAddress)
    const subnetBroadcastAddress = decimalToIp(currentNetworkAddress + increment - 1)
    subnetsInfo.push({
      subnetNetworkAddress,
      subnetBroadcastAddress,
      subnetFirstHost: incrementIp(subnetNetworkAddress),
      subnetLastHost: decrementIp(subnetBroadcastAddress),
    })
    currentNetworkAddress += increment
  }

  return subnetsInfo
}

const calculateNetwork = (ip, cidr, subnets) => {
  const subnetMask = cidrToSubnet(cidr)
  const ipParts = ip.split(".").map(Number)
  const subnetParts = subnetMask.split(".").map(Number)

  const networkAddress = ipParts
    .map((part, index) => part & subnetParts[index])
    .join(".")

  const broadcastAddress = ipParts
    .map((part, index) => (part & subnetParts[index]) | (~subnetParts[index] & 255))
    .join(".")

  return {
    networkAddress,
    broadcastAddress,
    firstHost: cidr >= 32 ? networkAddress : incrementIp(networkAddress),
    lastHost: cidr >= 31 ? broadcastAddress : decrementIp(broadcastAddress),
    ipClass: determineIpClass(ipParts[0]),
    subnetMask,
    numHosts: Math.max(0, Math.pow(2, 32 - cidr) - 2),
    ipBinary: convertToBinary(ipParts),
    subnetsInfo: calculateSubnets(networkAddress, cidr, subnets),
  }
}

export default function App() {
  const [ip, setIp] = useState("")
  const [subnets, setSubnets] = useState(1)
  const [cidr, setCidr] = useState(24)

  const result = useMemo(
    () => (ip ? calculateNetwork(ip, cidr, subnets) : {}),
    [ip, cidr, subnets]
  )

  return (
    <div className="grid place-items-center min-h-screen p-4">
      <div className="w-full sm:w-1/2 max-w-sm border-solid border-2 border-sky-500 p-3 rounded-xl">
        <div className="mb-4">
          <h1 className="text-center text-3xl block text-white familjen-grotesk-700 font-bold mb-2">
            Calculadora de IP
          </h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="text-center familjen-grotesk-400 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:ring-4 focus:ring-sky-500 focus:outline-none focus:shadow-outline hover:border-blue-600 transition-all duration-300 bg-[#242424] text-[#ffffffde] caret-sky-500"
              placeholder="Endereço IP (exemplo 192.168.0.103)"
              aria-label="endereco"
            />
            <button
              type="button"
              onClick={() => setIp(generateRandomIp())}
              className="shrink-0 px-3 py-2 border rounded bg-[#242424] text-sky-400 hover:border-sky-500 hover:text-sky-300 transition-all duration-300 familjen-grotesk-400"
              title="Gerar IP aleatório"
            >
              ?
            </button>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="cidr" className="text-white familjen-grotesk-400">CIDR:</label>
            <span className="text-sky-400 familjen-grotesk-700">/{cidr}</span>
          </div>
          <div className="px-2">
            <input
              id="cidr"
              type="range"
              min={1}
              max={32}
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#3a3a3a] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sky-500 [&::-moz-range-thumb]:border-0"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 familjen-grotesk-400">
            <span>/1</span>
            <span>/32</span>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="subnets" className="text-white familjen-grotesk-400">
            Quantidade de subredes:
          </label>
          <select
            id="subnets"
            value={subnets}
            onChange={(e) => setSubnets(Number(e.target.value))}
            className="w-full py-2 px-3 bg-[#242424] text-white border rounded focus:ring-4 focus:ring-sky-500 focus:outline-none transition-all duration-300 hover:border-blue-600"
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
            <p className="text-white familjen-grotesk-400">
              Quantidade de Hosts:
            </p>
            <p className="text-white familjen-grotesk-400">
              {result.numHosts || "-"}
            </p>
          </div>
          <hr className="mt-2 mb-2" />
          <div className="grid place-items-center">
            <p className="text-white familjen-grotesk-700">IP em Binário:</p>
            <p className="text-white familjen-grotesk-400">
              {result.ipBinary || "-"}
            </p>
          </div>
        </div>
        <hr className="mt-2 mb-2" />
        <div>
          <h3 className="text-white familjen-grotesk-400 mb-2">Subredes:</h3>
          <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-sky-500">
            {result.subnetsInfo?.map((subnet, index) => (
              <div key={subnet.subnetNetworkAddress} className="mb-2 p-2 bg-[#333] rounded">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">Subrede:</p>
                  <p className="text-white familjen-grotesk-400">{index + 1}</p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Endereço de Rede:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetNetworkAddress}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Primeiro Host:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetFirstHost}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Último Host:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetLastHost}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Endereço de Broadcast:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetBroadcastAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
