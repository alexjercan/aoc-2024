local function split(inputstr, sep)
  if sep == nil then
    sep = "%s"
  end
  local t = {}
  for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
    table.insert(t, str)
  end
  return t
end

local function dump(o)
   if type(o) == 'table' then
      local s = '{ '
      for k,v in pairs(o) do
         if type(k) ~= 'number' then k = '"'..k..'"' end
         s = s .. '['..k..'] = ' .. dump(v) .. ','
      end
      return s .. '} '
   else
      return tostring(o)
   end
end

local function all_trim(s)
   return s:match( "^%s*(.-)%s*$" )
end

local function tablelength(T)
  local count = 0
  for _ in pairs(T) do count = count + 1 end
  return count
end

local function parseInput(input)
    local t = split(input, "\n")
    local a = tonumber(split(t[1], ":")[2])
    local b = tonumber(split(t[2], ":")[2])
    local c = tonumber(split(t[3], ":")[2])
    local program = {}
    local numbers = all_trim(split(t[4], ":")[2])
    local nums = split(numbers, ",")
    for _,num in pairs(nums) do
        table.insert(program, tonumber(num))
    end

    return {
        a=a,
        b=b,
        c=c,
        program=program
    }
end

local function part1(info)
    local ip = 1
    local a = info["a"]
    local b = info["b"]
    local c = info["c"]
    local program = info["program"]
    local n = tablelength(program)

    local out = {}
    while ip <= n do
        local opcode = program[ip]
        local operand = program[ip + 1]

        local combo = 0
        if operand <= 3 then
            combo = operand
        elseif operand == 4 then
            combo = a
        elseif operand == 5 then
            combo = b
        elseif operand == 6 then
            combo = c
        else
            error("Operand: " .. opcode .. " is invalid!")
        end

        if opcode == 0 then -- adv
            a = math.floor(a / (2 ^ combo))
        elseif opcode == 1 then -- bxl
            b = b ~ operand
        elseif opcode == 2 then -- bst
            b = combo % 8
        elseif opcode == 3 then -- jnz
            if a ~= 0 then
                ip = operand + 1
                goto continue
            end
        elseif opcode == 4 then -- bxc
            b = b ~ c
        elseif opcode == 5 then -- out
            table.insert(out, combo % 8)
        elseif opcode == 6 then -- bdv
            b = math.floor(a / (2 ^ combo))
        elseif opcode == 7 then -- cdv
            c = math.floor(a / (2 ^ combo))
        else
            error("Opcode: " .. dump(opcode) .. " is no implemented!")
        end

        ip = ip + 2
        ::continue::
    end

    return out
end

local function part1Scuffed(info)
    local ip = 1
    local a = info["a"]
    local b = info["b"]
    local c = info["c"]
    local program = info["program"]
    local n = tablelength(program)

    while ip <= n do
        local opcode = program[ip]
        local operand = program[ip + 1]

        local combo = 0
        if operand <= 3 then
            combo = operand
        elseif operand == 4 then
            combo = a
        elseif operand == 5 then
            combo = b
        elseif operand == 6 then
            combo = c
        else
            error("Operand: " .. opcode .. " is invalid!")
        end

        if opcode == 0 then -- adv
            a = math.floor(a / (2 ^ combo))
        elseif opcode == 1 then -- bxl
            b = b ~ operand
        elseif opcode == 2 then -- bst
            b = combo % 8
        elseif opcode == 4 then -- bxc
            b = b ~ c
        elseif opcode == 5 then -- out
            return combo % 8
        elseif opcode == 6 then -- bdv
            b = math.floor(a / (2 ^ combo))
        elseif opcode == 7 then -- cdv
            c = math.floor(a / (2 ^ combo))
        else
            error("Opcode: " .. dump(opcode) .. " is no implemented!")
        end

        ip = ip + 2
    end
end

local function part2(info)
    local program = info["program"]

    local prev = {0}
    for i, _ in pairs(program) do
        local index = #program - i + 1

        local new_prev = {}
        for _, prev_a in pairs(prev) do
            for last = 0, 7 do
                if last == 0 and prev_a == 0 then
                    goto continue
                end

                local a = prev_a * 8 + last
                info["a"] = a
                local b3 = part1Scuffed(info)
                if b3 == program[index] then
                    table.insert(new_prev, a)
                end

                ::continue::
            end
        end

        prev = new_prev
    end

    table.sort(prev)
    return prev[1]
end

input = io.read("*all")
info = parseInput(input)
out = part1(info)
print("Part1: " .. table.concat(out, ","))
result = part2(info)
print("Part2: " .. dump(result))
